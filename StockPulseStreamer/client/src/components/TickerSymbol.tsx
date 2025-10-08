import { cn } from "@/lib/utils";

interface TickerSymbolProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function TickerSymbol({ symbol, size = "md", className }: TickerSymbolProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span 
      className={cn(
        "font-mono font-semibold uppercase tracking-wider",
        sizeClasses[size],
        className
      )}
      data-testid={`ticker-${symbol}`}
    >
      {symbol}
    </span>
  );
}
