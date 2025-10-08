import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PriceChangeProps {
  value: number;
  format?: "badge" | "text";
  showIcon?: boolean;
  className?: string;
}

export default function PriceChange({ value, format = "badge", showIcon = true, className }: PriceChangeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const colorClass = isPositive 
    ? "text-positive" 
    : isNegative 
    ? "text-negative" 
    : "text-muted-foreground";

  const bgClass = isPositive
    ? "bg-positive/10 text-positive border-positive/20"
    : isNegative
    ? "bg-negative/10 text-negative border-negative/20"
    : "bg-muted text-muted-foreground";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const formattedValue = `${isPositive ? "+" : ""}${value.toFixed(2)}%`;

  if (format === "text") {
    return (
      <div className={cn("flex items-center gap-1 font-mono text-sm font-semibold", colorClass, className)} data-testid="price-change">
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{formattedValue}</span>
      </div>
    );
  }

  return (
    <Badge variant="outline" className={cn("gap-1 font-mono", bgClass, className)} data-testid="price-change-badge">
      {showIcon && <Icon className="h-3 w-3" />}
      {formattedValue}
    </Badge>
  );
}
