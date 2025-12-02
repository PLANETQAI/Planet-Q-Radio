export const runtime = 'nodejs';

const TARGET = 'http://localhost:3000/productions';
const TARGET_ORIGIN = 'http://localhost:3000';
const HOST_DOMAIN = 'http://localhost:3001';

function isHopByHop(name) {
  const hopByHop = new Set([
    'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
    'te', 'trailer', 'transfer-encoding', 'upgrade'
  ]);
  return hopByHop.has(name.toLowerCase());
}

function copyHeadersForRequest(incomingHeaders, opts = {}) {
  const out = {};
  for (const [k, v] of incomingHeaders.entries ? incomingHeaders.entries() : Object.entries(incomingHeaders)) {
    const key = String(k).toLowerCase();
    if (isHopByHop(key)) continue;
    if (key === 'host') continue;
    out[k] = v;
  }
  out['access-control-allow-origin'] = HOST_DOMAIN;
  out['access-control-allow-credentials'] = 'true';
  if (opts.forceIdentityEncoding) out['accept-encoding'] = 'identity';
  return out;
}

async function fetchFromTarget(path = '', req, opts = {}) {
  const url = new URL(path || '/', TARGET_ORIGIN);
  const targetBase = new URL(TARGET);
  const targetUrl = new URL(path, targetBase);
  const forwardedHeaders = copyHeadersForRequest(req.headers, opts);
  forwardedHeaders['host'] = targetUrl.host;
  const cookies = req.headers.get('cookie');
  if (cookies) forwardedHeaders['cookie'] = cookies;
  const fetchOptions = {
    method: req.method,
    headers: forwardedHeaders,
    redirect: 'manual'
  };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = await req.arrayBuffer();
  }
  return fetch(targetUrl.toString(), fetchOptions);
}

function rewriteHtml(html) {
  let out = html;
  const origins = [
    'https://www.planetqproductions.com',
    'https://planetqproductions.com',
    'http://www.planetqproductions.com',
    'http://planetqproductions.com',
    TARGET_ORIGIN
  ];
  origins.forEach(origin => { if (!origin) return; out = out.split(origin).join(HOST_DOMAIN); });
  // Rewrite only non _next and non public paths
  out = out.replace(/(href|src)=(["'])\/(?!_next\/|images\/|videos\/|static\/)([^"']*)\2/g, (m, attr, quote, path) => {
    return `${attr}=${quote}/api/proxy-productions?path=${encodeURIComponent('/' + path)}${quote}`;
  });
  out = out.replace(/<form([^>]*)action=(["'])\/(?!_next\/|images\/|videos\/|static\/)([^"']*)\2/gi, (m, p1, quote, path) => {
    return `<form${p1}action=${quote}/api/proxy-productions?path=${encodeURIComponent('/' + path)}${quote}`;
  });
  return out;
}

function stripDomainSecureSameSite(cookie) {
  return String(cookie)
    .replace(/;\s*domain=[^;]+/gi, '')
    .replace(/;\s*secure/gi, '')
    .replace(/;\s*samesite=[^;]+/gi, '');
}

function makeHeadersForResponse(targetHeaders) {
  const headers = new Headers();
  for (const [key, value] of targetHeaders.entries()) {
    if (isHopByHop(key.toLowerCase())) continue;
    if (key.toLowerCase() === 'set-cookie') continue;
    headers.set(key, value);
  }
  headers.set('access-control-allow-origin', HOST_DOMAIN);
  headers.set('access-control-allow-credentials', 'true');
  headers.set('x-proxied-by', 'planetqradio-proxy');
  return headers;
}

async function handleSetCookie(targetHeaders, responseHeaders) {
  const raw = targetHeaders.get ? targetHeaders.get('set-cookie') : null;
  if (!raw) return;
  const cookies = Array.isArray(raw) ? raw : String(raw).split(/,(?=[^;\s]*=[^;\s]*)/g);
  responseHeaders.delete('set-cookie');
  for (const c of cookies) {
    if (!c || !c.trim()) continue;
    let cleaned = stripDomainSecureSameSite(c);
    if (HOST_DOMAIN.startsWith('https')) cleaned = cleaned.trim() + '; Secure';
    responseHeaders.append('set-cookie', cleaned);
  }
}

function isAssetPath(path) {
  if (!path) return false;
  const lower = path.toLowerCase();
  if (lower.startsWith('/_next/') || lower.startsWith('/static/') || lower.startsWith('/images/') || lower.startsWith('/videos/')) return true;
  return Boolean(lower.match(/\.(js|mjs|css|json|map|png|jpg|jpeg|webp|gif|svg|ico|bmp|avif|woff2|woff|ttf|otf|wasm)$/));
}

export async function GET(req) {
  try {
    const reqUrl = new URL(req.url);
    const path = reqUrl.searchParams.get('path') || reqUrl.pathname === '/api/proxy-productions' ? '/' : reqUrl.pathname;

    const targetRes = await fetchFromTarget(path, req, {forceIdentityEncoding: isAssetPath(path)});
    const headers = makeHeadersForResponse(targetRes.headers);
    await handleSetCookie(targetRes.headers, headers);

    if ([301,302,303,307,308].includes(targetRes.status)) {
      const location = targetRes.headers.get('location');
      if (location) {
        const newLocation = new URL(location, TARGET_ORIGIN);
        newLocation.host = new URL(HOST_DOMAIN).host;
        newLocation.protocol = new URL(HOST_DOMAIN).protocol;
        headers.set('location', newLocation.toString());
      }
      return new Response(null, {status: targetRes.status, headers});
    }

    const contentType = targetRes.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const text = await targetRes.text();
      const rewritten = rewriteHtml(text);
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.delete('content-length');
      return new Response(rewritten, {status: targetRes.status, headers});
    }

    return new Response(targetRes.body, { status: targetRes.status, headers });

  } catch (error) {
    console.error('Proxy GET error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error', message: String(error) }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'x-proxied-by': 'planetqradio-proxy',
        'access-control-allow-origin': HOST_DOMAIN,
        'access-control-allow-credentials': 'true'
      }
    });
  }
}

export async function POST(req) {
  return GET(req); // reuse GET logic for POST as we forward body
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': HOST_DOMAIN,
      'access-control-allow-methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'access-control-allow-headers': 'Content-Type, Authorization',
      'access-control-allow-credentials': 'true',
      'access-control-max-age': '86400',
      'x-proxied-by': 'planetqradio-proxy'
    }
  });
}
