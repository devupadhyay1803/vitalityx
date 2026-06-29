"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  // Aggregate data by date
  const chartData = data.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const existing = acc.find((item: any) => item.date === date);
    if (existing) {
      existing.revenue += (order.amount / 100);
    } else {
      acc.push({ date, revenue: (order.amount / 100) });
    }
    return acc;
  }, [] as {date: string, revenue: number}[]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--vx-jade)" 
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--vx-jade)", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#fff", stroke: "var(--vx-jade)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
