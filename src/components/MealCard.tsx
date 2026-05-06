import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Star } from "lucide-react";
import { decryptData } from "../lib/crypto";

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  tip?: string;
  timestamp: any;
  imageUrl?: string;
  isEncrypted?: boolean;
}

export function MealCard({ meal }: { meal: Meal }) {
  // ...
  const name = meal.isEncrypted ? decryptData(meal.name) : meal.name;
  
  const date = meal.timestamp?.toDate ? meal.timestamp.toDate() : new Date(meal.timestamp);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden border-none bg-card/60">
      <div className="flex gap-4 p-4">
        {meal.imageUrl ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <img src={meal.imageUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🥗</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold truncate pr-2">{name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal leading-4 h-5">
              {meal.calories} kcal
            </Badge>
            <div className="flex items-center gap-1 ml-auto">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(meal.healthScore / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <span>P: {meal.protein}g</span>
            <span>C: {meal.carbs}g</span>
            <span>F: {meal.fat}g</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
