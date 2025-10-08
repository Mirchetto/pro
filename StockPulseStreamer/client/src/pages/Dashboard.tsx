import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/DashboardHeader";
import WatchlistTable from "@/components/WatchlistTable";
import BoomCard from "@/components/BoomCard";
import NewsCard from "@/components/NewsCard";
import TickerDetailModal from "@/components/TickerDetailModal";
import { Zap, Activity } from "lucide-react";

// todo: remove mock functionality
const mockWatchlist = [
  { ticker: "AAPL", price: 178.45, change: 2.3, volume: 52000000, volumeMultiplier: 1.2, lastUpdate: new Date(Date.now() - 30000) },
  { ticker: "TSLA", price: 242.84, change: 4.7, volume: 98000000, volumeMultiplier: 1.8, lastUpdate: new Date(Date.now() - 45000) },
  { ticker: "NVDA", price: 495.22, change: -1.2, volume: 41000000, volumeMultiplier: 0.9, lastUpdate: new Date(Date.now() - 60000) },
];

const mockBoomStocks = [
  { ticker: "GME", price: 24.50, change: 8.5, volumeMultiplier: 3.2 },
  { ticker: "AMC", price: 6.85, change: 5.2, volumeMultiplier: 2.4 },
];

interface NewsItem {
  title: string;
  source: string;
  timestamp: Date;
  tickers: string[];
  sentiment: "positive" | "negative" | "neutral";
}

const initialNews: NewsItem[] = [
  {
    title: "Tech stocks rally on strong earnings reports",
    source: "Reuters",
    timestamp: new Date(Date.now() - 300000),
    tickers: ["AAPL", "MSFT", "GOOGL"],
    sentiment: "positive",
  },
  {
    title: "Federal Reserve announces interest rate decision",
    source: "Bloomberg",
    timestamp: new Date(Date.now() - 600000),
    tickers: ["SPY", "QQQ"],
    sentiment: "neutral",
  },
];

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  time: `${i}:00`,
  price: 24.5 + Math.random() * 2 - 1,
}));

export default function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "connecting" | "disconnected">("active");
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [newNewsIds, setNewNewsIds] = useState<Set<number>>(new Set());

  // Simulate news arriving in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const sentiments: ("positive" | "negative" | "neutral")[] = ["positive", "negative", "neutral"];
      const newNews = {
        title: `Breaking: Market update at ${new Date().toLocaleTimeString()}`,
        source: ["Reuters", "Bloomberg", "CNBC"][Math.floor(Math.random() * 3)],
        timestamp: new Date(),
        tickers: [["AAPL", "TSLA"], ["GME", "AMC"], ["NVDA", "AMD"]][Math.floor(Math.random() * 3)],
        sentiment: sentiments[Math.floor(Math.random() * 3)],
      };
      
      setNews(prev => {
        const updated = [newNews, ...prev];
        const newsId = Date.now();
        setNewNewsIds(prev => new Set([...Array.from(prev), newsId]));
        
        // Remove "new" indicator after 5 seconds
        setTimeout(() => {
          setNewNewsIds(prev => {
            const next = new Set(Array.from(prev));
            next.delete(newsId);
            return next;
          });
        }, 5000);
        
        return updated.slice(0, 10); // Keep only last 10 news
      });
    }, 8000); // New news every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    console.log("Refresh triggered");
    setStatus("connecting");
    setTimeout(() => setStatus("active"), 1000);
  };

  const handleSettings = () => {
    console.log("Settings opened");
  };

  const handleTickerClick = (ticker: string) => {
    console.log("Ticker clicked:", ticker);
    setSelectedTicker(ticker);
  };

  const selectedStock = selectedTicker === "GME" ? mockBoomStocks[0] : mockWatchlist[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardHeader 
        status={status}
        onRefresh={handleRefresh}
        onSettings={handleSettings}
        alertCount={mockBoomStocks.length}
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
              {mockBoomStocks.length > 0 && (
                <Badge className="ml-2 bg-warning text-warning-foreground border-0">
                  {mockBoomStocks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news">
              News Feed
              <div className="ml-2 h-2 w-2 rounded-full bg-positive animate-pulse" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {mockBoomStocks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-warning" />
                  <h2 className="text-xl font-bold">Boom Alerts</h2>
                  <Badge className="bg-warning/20 text-warning border-warning/30">
                    {mockBoomStocks.length} Active
                  </Badge>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mockBoomStocks.map((stock, index) => (
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
                  <Badge variant="outline">{mockWatchlist.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WatchlistTable items={mockWatchlist} onTickerClick={handleTickerClick} />
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
                {news.slice(0, 3).map((newsItem, index) => (
                  <NewsCard 
                    key={index} 
                    {...newsItem} 
                    isNew={index === 0 && newNewsIds.size > 0}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Active Watchlist
                  <Badge variant="outline">{mockWatchlist.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WatchlistTable items={mockWatchlist} onTickerClick={handleTickerClick} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boom" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockBoomStocks.map((stock, index) => (
                <BoomCard 
                  key={stock.ticker}
                  {...stock}
                  isNew={index === 0}
                  onViewDetails={() => handleTickerClick(stock.ticker)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <div className="max-w-4xl space-y-3">
              {news.map((newsItem, index) => (
                <NewsCard 
                  key={index} 
                  {...newsItem} 
                  isNew={index === 0 && newNewsIds.size > 0}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {selectedTicker && (
        <TickerDetailModal
          open={!!selectedTicker}
          onOpenChange={(open) => !open && setSelectedTicker(null)}
          ticker={selectedTicker}
          price={selectedStock.price}
          change={selectedStock.change}
          chartData={mockChartData}
          news={news}
          stats={{
            volume: 98000000,
            volumeMultiplier: selectedStock.volumeMultiplier,
            high: selectedStock.price * 1.05,
            low: selectedStock.price * 0.95,
            open: selectedStock.price * 0.98,
          }}
        />
      )}
    </div>
  );
}
