import { Martini, ShoppingBag, Sofa, UtensilsCrossed, Wrench } from "lucide-react";
import { ActivityType } from "@dshow/shared";

export function ActivityIcon({ type, className }: { type: ActivityType; className?: string }) {
  switch (type) {
    case ActivityType.RESTAURANT:
      return <UtensilsCrossed className={className} />;
    case ActivityType.TERRASSE:
      return <Sofa className={className} />;
    case ActivityType.BOITE_NUIT:
      return <Martini className={className} />;
    case ActivityType.SHOP:
      return <ShoppingBag className={className} />;
    case ActivityType.CORDONNERIE:
      return <Wrench className={className} />;
    default:
      return <ShoppingBag className={className} />;
  }
}

