import { TrendingUp, Volume2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TickerSymbol from "./TickerSymbol";
import PriceChange from "./PriceChange";
import { cn } from "@/lib/utils";

interface BoomCardProps {
  ticker: string;
  price: number;
  change: number;
  volumeMultiplier: number;
  onViewDetails?: () => void;
  isNew?: boolean;
}

export default function BoomCard({ ticker, price, change, volumeMultiplier, onViewDetails, isNew }: BoomCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-0 shadow-xl hover-elevate transition-all duration-300",
        "bg-gradient-to-br from-warning/20 via-card to-card",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-warning/20 before:to-transparent before:opacity-50",
        isNew && "animate-in zoom-in-95 duration-500"
      )} 
      data-testid={`boom-card-${ticker}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-3xl -z-10" />
      
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-warning animate-ping" />
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            <TickerSymbol symbol={ticker} size="lg" className="text-xl" />
          </div>
        </div>
        <PriceChange value={change} />
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div>
          <div className="text-5xl font-mono font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            ${price.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-sm mt-2">
            <Volume2 className="h-4 w-4 text-warning" />
            <span className="font-bold text-warning">{volumeMultiplier.toFixed(1)}x</span>
            <span className="text-muted-foreground">avg volume</span>
          </div>
        </div>
        
        <Button 
          className="w-full gap-2 bg-warning hover:bg-warning/90 text-warning-foreground font-semibold border-0 shadow-lg hover:shadow-warning/50 transition-all" 
          onClick={onViewDetails}
          data-testid={`button-view-details-${ticker}`}
        >
          <TrendingUp className="h-4 w-4" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
