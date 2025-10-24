import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image: string;
}

export function MealLog() {
  const meals: Meal[] = [
    {
      id: "1",
      name: "Avocado Toast with Eggs",
      time: "8:30 AM",
      calories: 420,
      protein: 18,
      carbs: 42,
      fats: 22,
      image: "https://images.unsplash.com/photo-1676471970358-1cff04452e7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzYxMjM0ODUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "2",
      name: "Greek Salad Bowl",
      time: "12:45 PM",
      calories: 380,
      protein: 22,
      carbs: 28,
      fats: 18,
      image: "https://images.unsplash.com/photo-1643750182373-b4a55a8c2801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWQlMjBib3dsfGVufDF8fHx8MTc2MTIzODc3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "3",
      name: "Grilled Chicken & Vegetables",
      time: "7:15 PM",
      calories: 650,
      protein: 48,
      carbs: 45,
      fats: 28,
      image: "https://images.unsplash.com/photo-1682423187670-4817da9a1b23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMG1lYWx8ZW58MXx8fHwxNzYxMjUyMTI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3>Today's Meals</h3>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Meal
        </Button>
      </div>

      <div className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
          >
            <ImageWithFallback
              src={meal.image}
              alt={meal.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="mb-1">{meal.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{meal.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg text-green-600">{meal.calories}</div>
                  <div className="text-xs text-gray-500">calories</div>
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Protein</span>
                  <span className="text-sm">{meal.protein}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Carbs</span>
                  <span className="text-sm">{meal.carbs}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Fats</span>
                  <span className="text-sm">{meal.fats}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          {mealTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              className="h-auto py-3 flex flex-col items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">{type}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
