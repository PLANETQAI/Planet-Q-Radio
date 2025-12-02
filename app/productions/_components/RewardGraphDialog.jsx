"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, ArrowDown, ArrowUp, Award, Clock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Area, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUser } from "../../../context/UserContext"; // Import useUser
import api from "../../../lib/api";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value).replace(/,/g, '');
};

const PriceChangeIndicator = ({ value }) => {
  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <div className={`inline-flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      <Icon className="w-3 h-3 mr-1" />
      <span>{Math.abs(value)}%</span>
    </div>
  );
};

export default function RewardGraphDialog(
{ isOpen, onClose }
) {
  const { user, isAuthenticated, loading: userLoading } = useUser(); // Use useUser
  const route = useRouter();
  const currentUserId = isAuthenticated ? user?.user.id : null; // Only set currentUserId if authenticated

  const [data, setData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [priceChange, setPriceChange] = useState({ value: 2.34, isPositive: true });
  const [stats, setStats] = useState({
    totalRewards: 0,
    totalUsers: 1,
    avgPoints: 0,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [currentPrice, setCurrentPrice] = useState(0);
  const priceRef = useRef(0);
  const priceAnimationRef = useRef(null);
  const lastDataPointRef = useRef(null);

  const updatePriceAnimation = useCallback((newPrice) => {
    if (priceAnimationRef.current) {
      cancelAnimationFrame(priceAnimationRef.current);
    }

    const startTime = Date.now();
    const startValue = priceRef.current;
    const endValue = newPrice;
    const duration = 1000; // 1 second animation

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease out function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setCurrentPrice(currentValue);
      priceRef.current = currentValue;
      
      if (progress < 1) {
        priceAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    
    priceAnimationRef.current = requestAnimationFrame(animate);
  }, []);

  const intervalRef = useRef(null); // Declare intervalRef outside useEffect

  useEffect(() => {
    // Only proceed if user loading is complete and user is authenticated
    if (userLoading || !isAuthenticated || !currentUserId) {
      // Clear any existing interval if the user becomes unauthenticated or is loading
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setData([]); // Clear data if not authenticated
      setUserPosition(null);
      return;
    }

    const fetchRewards = async () => {
      try {
        const res = await api.get("/api/rewards/stream");
        const responseData = res.data;
        

        // Handle case where response is not an array
        const rewards = Array.isArray(responseData) ? responseData : [];
        
        // Aggregate cumulative points per user and track changes
        const userPointsMap = {};
        let totalPoints = 0;
        const uniqueUserIds = new Set();
        
        rewards.forEach((item) => {
          // Safely extract user ID and points with fallbacks
          const userId = item?.user?.id || item?.userId;
          const points = Number(item?.points) || 0;
          
          if (!userId) {
            console.warn('Skipping reward entry with missing user ID:', item);
            return;
          }

          if (!userPointsMap[userId]) userPointsMap[userId] = 0;
          userPointsMap[userId] += points;
          totalPoints += points;
          uniqueUserIds.add(userId);
        });

        // Compute current user rank
        const sortedUsers = Object.entries(userPointsMap).sort(([, a], [, b]) => b - a);
        const position = sortedUsers.findIndex(([uid]) => uid === currentUserId) + 1;
        setUserPosition(position > 0 ? position : null);

        // Process data for chart
        const graphData = rewards
          .map((item) => {
            const userId = item?.user?.id || item?.userId;
            const points = Number(item?.points) || 0;
            const createdAt = item?.createdAt ? new Date(item.createdAt) : new Date();
            
            if (!userId) return null;

            return {
              time: createdAt.toLocaleTimeString(),
              timestamp: createdAt.getTime(),
              points: points,
              userId: userId,
              isCurrentUser: userId === currentUserId,
            };
          })
          .filter(Boolean); // Remove any null entries

        // Sort by timestamp to ensure proper ordering
        graphData.sort((a, b) => a.timestamp - b.timestamp);

        // Calculate price change if we have enough data points
        if (graphData.length > 1) {
          const lastPoint = graphData[graphData.length - 1];
          const prevPoint = graphData[Math.max(0, graphData.length - 2)];
          
          if (lastPoint.points !== 0 && prevPoint.points !== 0) {
            const change = ((lastPoint.points - prevPoint.points) / prevPoint.points) * 100;
            setPriceChange({
              value: Math.abs(change).toFixed(2),
              isPositive: change >= 0
            });
          }
        }

        // Update current price with animation if we have data
        if (graphData.length > 0) {
          const latestPoint = graphData[graphData.length - 1];
          updatePriceAnimation(latestPoint.points);
          lastDataPointRef.current = latestPoint;
        }

        // Update stats
        setStats({
          totalRewards: totalPoints,
          totalUsers: uniqueUserIds.size || 1, // Default to 1 to avoid division by zero
          avgPoints: uniqueUserIds.size > 0 ? Math.round(totalPoints / uniqueUserIds.size) : totalPoints,
          lastUpdated: new Date().toLocaleTimeString()
        });

        setData(graphData.length > 0 ? graphData : [{
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          points: 0,
          userId: currentUserId,
          isCurrentUser: true
        }]);
      } catch (err) {
        console.error("Failed to fetch rewards:", err);
        // Set some default data in case of error
        setData([{
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          points: 0,
          userId: currentUserId,
          isCurrentUser: true
        }]);
      }
    };

    // Initial fetch
    fetchRewards();

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchRewards, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentUserId, updatePriceAnimation, user, isAuthenticated, userLoading]); // Add isAuthenticated and userLoading to dependency array

  // Generate fake data for the sparkline when there's not enough real data
  const getSparklineData = useCallback(() => {
    if (data.length > 1) return data;
    
    // Generate some sample data points around the actual data point
    const basePoints = data[0]?.points || 10;
    return Array.from({ length: 20 }).map((_, i) => ({
      time: `${i * 5}m`,
      points: Math.max(1, basePoints * (0.9 + Math.random() * 0.2)),
      isCurrentUser: true
    }));
  }, [data]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700/50 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                REWARDS MARKET
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Real-time rewards tracking and analytics
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">Your Rank</div>
                <div className="text-yellow-400 font-mono text-xl font-bold">
                  #{userPosition || '-'}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Points</div>
                <div className="text-white font-mono text-xl font-bold">
                  {currentPrice.toFixed(2)}
                  <span className={`ml-2 text-xs ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange.isPositive ? '↑' : '↓'} {priceChange.value}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4
          [&>div]:bg-slate-800/50 [&>div]:backdrop-blur-sm [&>div]:rounded-lg [&>div]:p-3 [&>div]:border [&>div]:border-slate-700/50">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-500/10 text-green-400 mr-3">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Points</div>
              <div className="font-bold">{stats.totalRewards}</div>
            </div>
          </div>
       
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-400 mr-3">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Avg. Points</div>
              <div className="font-bold">{stats.avgPoints}</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 mr-3">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Last Updated</div>
              <div className="font-mono text-sm">{stats.lastUpdated}</div>
            </div>
          </div>
             <div className="flex items-center">
            <Button onClick={() => route.push('/payment/withdraw')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Withdraw
            </Button>
          </div>
        </div>

        <div className="relative w-full mt-2 rounded-xl overflow-hidden border border-slate-700/50" style={{ height: '400px' }}>
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}></div>
          
          {/* Price indicator line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-30"></div>
          
          {/* Chart container */}
          <div className="absolute inset-0 p-1 z-10">

            <div style={{ width: '100%', height: '100%', padding: '10px 0' }}>
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={data.length > 1 ? data : getSparklineData()}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    
                    <XAxis
                      dataKey="time"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: 'transparent' }}
                      tickLine={false}
                      tickMargin={10}
                      padding={{ left: 10, right: 10 }}
                    />
                    
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      width={50}
                      domain={['auto', 'auto']}
                    />
                    
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
                              <div className="text-xs text-slate-400 mb-1">{label}</div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mr-2"></div>
                                <span className="font-mono text-sm">
                                  {payload[0].value.toFixed(2)} <span className="text-slate-500">points</span>
                                </span>
                              </div>
                              {payload[0].payload.isCurrentUser && (
                                <div className="mt-1 text-xs text-yellow-400 flex items-center">
                                  <Zap className="w-3 h-3 mr-1" /> Your reward
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    {/* Area under the line */}
                    <Area
                      type="monotone"
                      dataKey="points"
                      fill="url(#areaGradient)"
                      stroke="transparent"
                      activeDot={false}
                    />
                    
                    {/* Main line */}
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke="url(#lineGradient)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: 'white',
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        className: 'shadow-lg'
                      }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    
                    {/* Current price indicator */}
                    {data.length > 0 && (
                      <ReferenceLine 
                        y={data[data.length - 1].points} 
                        stroke="#4ade80" 
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                      />
                    )}
                    
                    {/* Current price label */}
                    {data.length > 0 && (
                      <ReferenceLine 
                        y={data[data.length - 1].points} 
                        label={{
                          value: `${data[data.length - 1].points.toFixed(2)}`,
                          position: 'right',
                          fill: '#94a3b8',
                          fontSize: 12,
                          dx: 10
                        }}
                        stroke="transparent"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-dashed border-slate-700 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300 mb-1">No data available</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Start earning rewards to see your progress here
                  </p>
                </div>
              )}
            </div>

            {/* Timeframe selector */}
            <div className="absolute bottom-2 left-0 right-0">
              <div className="flex justify-center space-x-1">
                {['24h', '12h', '6h', '1h', '30m', 'Live'].map((timeframe) => (
                  <button
                    key={timeframe}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      timeframe === 'Live' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Real-time data updates every 5 seconds
          </div>
          <div className="flex space-x-2">
        
            <DialogFooter>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-800" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
