import { useEffect, useState } from "react";
import { Dot, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RewardGraph({ currentUserId }) {
  const [data, setData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    const evtSource = new EventSource("/api/rewards/stream");

    evtSource.onmessage = (event) => {
      const rewards = JSON.parse(event.data);

      // Aggregate cumulative points per user
      const userPointsMap = {};
      rewards.forEach((r) => {
        if (!userPointsMap[r.user.id]) userPointsMap[r.user.id] = 0;
        userPointsMap[r.user.id] += r.points;
      });

      // Compute user rank
      const sortedUsers = Object.entries(userPointsMap).sort(([, a], [, b]) => b - a);
      const position = sortedUsers.findIndex(([uid]) => uid === currentUserId) + 1;
      setUserPosition(position);

      // Flatten rewards for chart data
      const graphData = rewards.map((r) => ({
        time: new Date(r.createdAt).toLocaleTimeString(),
        points: r.points,
        userId: r.user.id,
        isCurrentUser: r.user.id === currentUserId,
      }));

      setData(graphData);
    };

    return () => evtSource.close();
  }, [currentUserId]);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#8884d8"
            dot={(props) =>
              props.payload.isCurrentUser ? <Dot {...props} r={6} fill="red" /> : <Dot {...props} r={3} />
            }
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="absolute top-2 right-2 text-white font-bold">
        Your position: {userPosition || "-"}
      </div>
    </div>
  );
}
