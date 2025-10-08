import { X, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TickerSymbol from "./TickerSymbol";
import PriceChange from "./PriceChange";
import PriceChart from "./PriceChart";
import NewsCard from "./NewsCard";

interface TickerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  price: number;
  change: number;
  chartData: Array<{ time: string; price: number }>;
  news: Array<{
    title: string;
    source: string;
    timestamp: Date;
    tickers: string[];
    url?: string;
    sentiment?: "positive" | "negative" | "neutral";
  }>;
  stats: {
    volume: number;
    volumeMultiplier: number;
    high: number;
    low: number;
    open: number;
  };
}

export default function TickerDetailModal({ 
  open, 
  onOpenChange, 
  ticker, 
  price, 
  change, 
  chartData,
  news,
  stats
}: TickerDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="modal-ticker-detail">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TickerSymbol symbol={ticker} size="lg" />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-mono font-semibold">${price.toFixed(2)}</span>
                <PriceChange value={change} />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-ticker-detail">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news">News</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart (5 min)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PriceChart data={chartData} color="auto" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-semibold">{stats.volume.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{stats.volumeMultiplier.toFixed(1)}x avg</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">High</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-semibold">${stats.high.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Low</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-semibold">${stats.low.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-semibold">${stats.open.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-3 mt-4">
            {news.map((item, index) => (
              <NewsCard key={index} {...item} />
            ))}
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                    <div className="text-2xl font-mono font-semibold">${price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Change</div>
                    <PriceChange value={change} format="text" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Day Range</div>
                    <div className="font-mono">${stats.low.toFixed(2)} - ${stats.high.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Volume Multiplier</div>
                    <div className="font-mono">{stats.volumeMultiplier.toFixed(2)}x</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
