import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";

interface MacroSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function MacroSummary({ calories, protein, carbs, fat, goals }: MacroSummaryProps) {
  const calPercentage = Math.min((calories / goals.calories) * 100, 100);
  const proteinPercentage = Math.min((protein / goals.protein) * 100, 100);
  const carbsPercentage = Math.min((carbs / goals.carbs) * 100, 100);
  const fatPercentage = Math.min((fat / goals.fat) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MacroCard
        title="Calories"
        value={calories}
        unit="kcal"
        goal={goals.calories}
        percentage={calPercentage}
        icon={<Flame className="w-4 h-4 text-orange-500" />}
        color="bg-orange-500"
      />
      <MacroCard
        title="Protein"
        value={protein}
        unit="g"
        goal={goals.protein}
        percentage={proteinPercentage}
        icon={<Beef className="w-4 h-4 text-red-500" />}
        color="bg-red-500"
      />
      <MacroCard
        title="Carbs"
        value={carbs}
        unit="g"
        goal={goals.carbs}
        percentage={carbsPercentage}
        icon={<Wheat className="w-4 h-4 text-blue-500" />}
        color="bg-blue-500"
      />
      <MacroCard
        title="Fat"
        value={fat}
        unit="g"
        goal={goals.fat}
        percentage={fatPercentage}
        icon={<Droplets className="w-4 h-4 text-yellow-500" />}
        color="bg-yellow-500"
      />
    </div>
  );
}

function MacroCard({ title, value, unit, goal, percentage, icon, color }: any) {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value} <span className="text-sm font-normal text-muted-foreground">/ {goal} {unit}</span>
        </div>
        <Progress value={percentage} className={`h-2 mt-3 ${color}`} />
      </CardContent>
    </Card>
  );
}
