import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/DashboardHeader";
import WatchlistTable from "@/components/WatchlistTable";
import BoomCard from "@/components/BoomCard";
import NewsCard from "@/components/NewsCard";
import TickerDetailModal from "@/components/TickerDetailModal";
import { Zap, Activity } from "lucide-react";
import { useStocks, useBoomStocks, useNews, useNewsByTicker, usePriceHistory, useStatus } from "@/hooks/useStocks";
import type { Stock, BoomStock, News } from "@shared/schema";

export default function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [newNewsIds, setNewNewsIds] = useState<Set<string>>(new Set());
  const previousNewsCount = useRef(0);

  const { data: stocks = [], isLoading: stocksLoading } = useStocks();
  const { data: boomStocks = [], isLoading: boomLoading } = useBoomStocks();
  const { data: newsData = [], isLoading: newsLoading } = useNews(50);
  const { data: tickerNews = [] } = useNewsByTicker(selectedTicker || "");
  const { data: priceHistory = [] } = usePriceHistory(selectedTicker || "", 100);
  const { data: systemStatus } = useStatus();

  const status: "active" | "connecting" | "disconnected" =
    systemStatus?.newsFetcher.isRunning && systemStatus?.marketMonitor.isRunning
      ? "active"
      : "disconnected";

  useEffect(() => {
    if (newsData.length > previousNewsCount.current && previousNewsCount.current > 0) {
      const newCount = newsData.length - previousNewsCount.current;
      const newIds = newsData.slice(0, newCount).map(n => n.id);
      setNewNewsIds(new Set(newIds));

      setTimeout(() => {
        setNewNewsIds(new Set());
      }, 5000);
    }
    previousNewsCount.current = newsData.length;
  }, [newsData.length]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSettings = () => {
    console.log("Settings opened");
  };

  const handleTickerClick = (ticker: string) => {
    console.log("Ticker clicked:", ticker);
    setSelectedTicker(ticker);
  };

  const selectedStock = boomStocks.find(b => b.symbol === selectedTicker) || stocks.find(s => s.symbol === selectedTicker);

  const watchlistItems = stocks.map(stock => ({
    ticker: stock.symbol,
    price: stock.currentPrice || 0,
    change: stock.previousClose && stock.currentPrice
      ? ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100
      : 0,
    volume: stock.volume || 0,
    volumeMultiplier: stock.avgVolume && stock.volume
      ? stock.volume / stock.avgVolume
      : 0,
    lastUpdate: new Date(stock.addedAt),
  }));

  const boomItems = boomStocks.map(boom => ({
    ticker: boom.symbol,
    price: boom.currentPrice,
    change: boom.priceChange,
    volumeMultiplier: boom.volumeRatio,
  }));

  const chartData = priceHistory.map((p, i) => ({
    time: new Date(p.timestamp).toLocaleTimeString(),
    price: p.price,
  })).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardHeader 
        status={status}
        onRefresh={handleRefresh}
        onSettings={handleSettings}
        alertCount={boomItems.length}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="overview" data-testid="tabs-dashboard">
          <TabsList className="bg-card">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="watchlist" data-testid="tab-watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="boom" data-testid="tab-boom">
              <Zap className="h-4 w-4 mr-2" />
              Boom Stocks
              {boomItems.length > 0 && (
                <Badge className="ml-2 bg-warning text-warning-foreground border-0">
                  {boomItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news">
              News Feed
              <div className="ml-2 h-2 w-2 rounded-full bg-positive animate-pulse" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {boomItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-warning" />
                  <h2 className="text-xl font-bold">Boom Alerts</h2>
                  <Badge className="bg-warning/20 text-warning border-warning/30">
                    {boomItems.length} Active
                  </Badge>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {boomItems.map((stock, index) => (
                    <BoomCard
                      key={stock.ticker}
                      {...stock}
                      isNew={index === 0}
                      onViewDetails={() => handleTickerClick(stock.ticker)}
                    />
                  ))}
                </div>
              </div>
            )}

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Watchlist
                  <Badge variant="outline">{watchlistItems.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stocksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : watchlistItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No stocks in watchlist. Waiting for news...</div>
                ) : (
                  <WatchlistTable items={watchlistItems} onTickerClick={handleTickerClick} />
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Latest News
                  <div className="h-2 w-2 rounded-full bg-positive animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {newsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading news...</div>
                ) : newsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No news available</div>
                ) : (
                  newsData.slice(0, 3).map((newsItem) => (
                    <NewsCard
                      key={newsItem.id}
                      title={newsItem.headline}
                      source={newsItem.source}
                      timestamp={new Date(newsItem.publishedAt)}
                      tickers={newsItem.tickers || []}
                      url={newsItem.url}
                      sentiment="neutral"
                      isNew={newNewsIds.has(newsItem.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Active Watchlist
                  <Badge variant="outline">{watchlistItems.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stocksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : watchlistItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No stocks in watchlist. Waiting for news...</div>
                ) : (
                  <WatchlistTable items={watchlistItems} onTickerClick={handleTickerClick} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boom" className="mt-6">
            {boomLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : boomItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No boom stocks detected yet</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {boomItems.map((stock, index) => (
                  <BoomCard
                    key={stock.ticker}
                    {...stock}
                    isNew={index === 0}
                    onViewDetails={() => handleTickerClick(stock.ticker)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            {newsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading news...</div>
            ) : newsData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No news available</div>
            ) : (
              <div className="max-w-4xl space-y-3">
                {newsData.map((newsItem) => (
                  <NewsCard
                    key={newsItem.id}
                    title={newsItem.headline}
                    source={newsItem.source}
                    timestamp={new Date(newsItem.publishedAt)}
                    tickers={newsItem.tickers || []}
                    url={newsItem.url}
                    sentiment="neutral"
                    isNew={newNewsIds.has(newsItem.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {selectedTicker && selectedStock && (
        <TickerDetailModal
          open={!!selectedTicker}
          onOpenChange={(open) => !open && setSelectedTicker(null)}
          ticker={selectedTicker}
          price={(selectedStock as any).currentPrice || (selectedStock as any).price || 0}
          change={(selectedStock as any).priceChange || ((selectedStock as any).currentPrice && (selectedStock as any).previousClose ? (((selectedStock as any).currentPrice - (selectedStock as any).previousClose) / (selectedStock as any).previousClose) * 100 : 0)}
          chartData={chartData.length > 0 ? chartData : [{ time: "0:00", price: 0 }]}
          news={tickerNews.map(n => ({
            title: n.headline,
            source: n.source,
            timestamp: new Date(n.publishedAt),
            tickers: n.tickers || [],
            sentiment: "neutral" as const,
            url: n.url,
          }))}
          stats={{
            volume: (selectedStock as any).volume || 0,
            volumeMultiplier: (selectedStock as any).volumeRatio || (selectedStock as any).volumeMultiplier || 0,
            high: ((selectedStock as any).currentPrice || (selectedStock as any).price || 0) * 1.05,
            low: ((selectedStock as any).currentPrice || (selectedStock as any).price || 0) * 0.95,
            open: ((selectedStock as any).currentPrice || (selectedStock as any).price || 0) * 0.98,
          }}
        />
      )}
    </div>
  );
}
