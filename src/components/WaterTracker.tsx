import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Droplets, Plus, Minus } from "lucide-react";
import { useState } from "react";

export function WaterTracker() {
  const [glasses, setGlasses] = useState(6);
  const target = 8;
  const percentage = (glasses / target) * 100;

  const addGlass = () => {
    if (glasses < target) setGlasses(glasses + 1);
  };

  const removeGlass = () => {
    if (glasses > 0) setGlasses(glasses - 1);
  };

  return (
    <Card className="p-6">
      <h3 className="mb-6">Water Intake</h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#06b6d4"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className="w-8 h-8 text-cyan-500 mb-2" />
            <div className="text-3xl">{glasses}</div>
            <div className="text-sm text-gray-500">of {target} glasses</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={removeGlass}
          className="rounded-full"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          onClick={addGlass}
          className="bg-cyan-500 hover:bg-cyan-600 rounded-full px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Glass
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={`h-12 rounded-lg flex items-center justify-center transition-all ${
              i < glasses
                ? "bg-cyan-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Droplets className="w-5 h-5" />
          </div>
        ))}
      </div>
    </Card>
  );
}
