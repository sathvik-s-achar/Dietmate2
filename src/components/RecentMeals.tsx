import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock } from "lucide-react";

export function RecentMeals() {
  const recentMeals = [
    {
      id: "1",
      name: "Smoothie Bowl",
      time: "2 hours ago",
      calories: 320,
      image: "https://images.unsplash.com/photo-1656582117142-ce539fec964f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMHNtb290aGllJTIwYm93bHxlbnwxfHx8fDE3NjEyNzIzODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "2",
      name: "Greek Salad",
      time: "5 hours ago",
      calories: 380,
      image: "https://images.unsplash.com/photo-1643750182373-b4a55a8c2801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWQlMjBib3dsfGVufDF8fHx8MTc2MTIzODc3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "3",
      name: "Avocado Toast",
      time: "8 hours ago",
      calories: 420,
      image: "https://images.unsplash.com/photo-1676471970358-1cff04452e7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzYxMjM0ODUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-6">Recent Meals</h3>
      <div className="space-y-4">
        {recentMeals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ImageWithFallback
              src={meal.image}
              alt={meal.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="text-sm mb-1">{meal.name}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{meal.time}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-600">{meal.calories}</div>
              <div className="text-xs text-gray-500">kcal</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
