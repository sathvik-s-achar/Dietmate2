import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Flame, Target, TrendingUp, Droplets } from "lucide-react";

export function DashboardStats() {
  const stats = [
    {
      label: "Calories",
      current: 1450,
      target: 2000,
      unit: "kcal",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      label: "Protein",
      current: 68,
      target: 120,
      unit: "g",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Water",
      current: 6,
      target: 8,
      unit: "glasses",
      icon: Droplets,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      label: "Weekly Goal",
      current: 5,
      target: 7,
      unit: "days",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const percentage = (stat.current / stat.target) * 100;

        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl">{stat.current}</span>
                  <span className="text-sm text-gray-500">
                    / {stat.target} {stat.unit}
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
          </Card>
        );
      })}
    </div>
  );
}
