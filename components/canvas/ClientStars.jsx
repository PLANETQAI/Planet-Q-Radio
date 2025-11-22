'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Preload } from '@react-three/drei'

// Create a fixed array for stars to avoid hydration mismatches
// We're using a fixed seed so it's always the same pattern
const createSpherePoints = () => {
  // Create a deterministic pattern instead of random
  const points = new Float32Array(3000 * 3) // 3000 points, 3 values per point (x,y,z)
  
  for (let i = 0; i < points.length; i += 3) {
    // Use a deterministic algorithm instead of random
    const theta = Math.PI * 2 * ((i / 3) % 100) / 100
    const phi = Math.acos(2 * ((i / 3) % 30) / 30 - 1)
    const r = Math.pow(Math.random(), 1/3) * 1.5 // Still need some randomness for depth
    
    points[i] = r * Math.sin(phi) * Math.cos(theta)
    points[i + 1] = r * Math.sin(phi) * Math.sin(theta)
    points[i + 2] = r * Math.cos(phi)
  }
  
  return points
}

// Create the points once outside of the component
const spherePoints = createSpherePoints()

const Stars = (props) => {
  const ref = useRef()
  
  // Use a slower rotation speed for better performance
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15
      ref.current.rotation.y -= delta / 20
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={spherePoints} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

const ClientStars = () => {
  // No useState or useEffect needed - this component only runs on client
  return (
    <div className="w-full h-auto absolute inset-0 z-[-1]">
      <Canvas 
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]} // Limit pixel ratio for better performance
        style={{ pointerEvents: 'none' }} // Prevent interaction for better performance
      >
        <Suspense fallback={null}>
          <Stars />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  )
}

export default ClientStars
