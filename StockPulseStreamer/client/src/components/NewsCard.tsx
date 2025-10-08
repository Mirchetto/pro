import { ExternalLink, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TickerSymbol from "./TickerSymbol";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  title: string;
  source: string;
  timestamp: Date;
  tickers: string[];
  url?: string;
  sentiment?: "positive" | "negative" | "neutral";
  isNew?: boolean;
}

export default function NewsCard({ title, source, timestamp, tickers, url, sentiment, isNew }: NewsCardProps) {
  const sentimentColor = {
    positive: "border-l-positive bg-positive/5",
    negative: "border-l-negative bg-negative/5",
    neutral: "border-l-primary/50 bg-primary/5",
  }[sentiment || "neutral"];

  return (
    <Card 
      className={cn(
        "border-l-4 p-4 hover-elevate transition-all duration-300 relative overflow-hidden",
        sentimentColor,
        isNew && "animate-in slide-in-from-top-2 duration-500"
      )} 
      data-testid="news-card"
    >
      {isNew && (
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <Badge className="bg-primary text-primary-foreground gap-1 animate-pulse">
            <Sparkles className="h-3 w-3" />
            NEW
          </Badge>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold leading-tight flex-1">{title}</h3>
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-news"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{source}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-wrap">
            {tickers.map((ticker) => (
              <Badge key={ticker} variant="outline" className="text-xs font-semibold">
                <TickerSymbol symbol={ticker} size="sm" />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
