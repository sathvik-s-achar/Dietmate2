import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function MacroDistribution() {
  const data = [
    { name: "Protein", value: 30, color: "#3b82f6" },
    { name: "Carbs", value: 45, color: "#f59e0b" },
    { name: "Fats", value: 25, color: "#ec4899" },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-6">Macro Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-6 space-y-3">
        {data.map((macro) => (
          <div key={macro.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: macro.color }}
              />
              <span className="text-sm">{macro.name}</span>
            </div>
            <span>{macro.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
