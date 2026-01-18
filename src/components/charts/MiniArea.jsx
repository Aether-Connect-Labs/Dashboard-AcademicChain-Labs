import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MiniArea({ data }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#0f172a" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(15 23 42)",
            borderColor: "rgb(51 65 85)",
            borderRadius: 10,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#38bdf8"
          strokeWidth={2}
          fill="url(#areaColor)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

