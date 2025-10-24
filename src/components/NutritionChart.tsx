import { Card } from "./ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function NutritionChart() {
  const data = [
    { day: "Mon", calories: 1850, target: 2000 },
    { day: "Tue", calories: 2100, target: 2000 },
    { day: "Wed", calories: 1920, target: 2000 },
    { day: "Thu", calories: 1780, target: 2000 },
    { day: "Fri", calories: 2050, target: 2000 },
    { day: "Sat", calories: 1650, target: 2000 },
    { day: "Sun", calories: 1450, target: 2000 },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-6">Weekly Calorie Intake</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="calories"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorCalories)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            fill="none"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
