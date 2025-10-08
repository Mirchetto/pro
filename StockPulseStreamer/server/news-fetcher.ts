import { financialDataClient } from "./finnhub";
import { storage } from "./storage";
import type { InsertNews, InsertStock } from "@shared/schema";

class NewsFetcherService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  async start() {
    if (this.isRunning) {
      console.log("📰 News fetcher already running");
      return;
    }

    const settings = await storage.getAlertSettings();
    const intervalMs = settings.newsFetchIntervalSeconds * 1000;

    console.log(`📰 Starting news fetcher (interval: ${settings.newsFetchIntervalSeconds}s)`);
    
    this.isRunning = true;

    // Fetch immediately on start
    await this.fetchAndProcessNews();

    // Then fetch at regular intervals
    this.intervalId = setInterval(async () => {
      await this.fetchAndProcessNews();
    }, intervalMs);
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("📰 News fetcher stopped");
  }

  private async fetchAndProcessNews() {
    try {
      console.log("📰 Fetching latest financial news...");
      
      // Fetch news from Finnhub/Polygon
      const newsArticles = await financialDataClient.getNews(50);
      
      if (newsArticles.length === 0) {
        console.log("📰 No news articles fetched");
        return;
      }

      console.log(`📰 Fetched ${newsArticles.length} news articles`);

      const processedArticles: InsertNews[] = [];
      const newTickers = new Set<string>();

      for (const article of newsArticles) {
        // Extract tickers from headline and summary
        const textToAnalyze = `${article.headline} ${article.summary || ''}`;
        const extractedTickers = financialDataClient.extractTickers(textToAnalyze);

        // Combine extracted tickers with any tickers already in the article
        const allTickers = new Set([
          ...(article.tickers || []),
          ...extractedTickers
        ]);

        const tickersArray = Array.from(allTickers);

        // Track new tickers
        tickersArray.forEach(ticker => newTickers.add(ticker));

        processedArticles.push({
          headline: article.headline!,
          summary: article.summary || null,
          source: article.source!,
          url: article.url!,
          publishedAt: article.publishedAt!,
          tickers: tickersArray.length > 0 ? tickersArray : null,
          category: article.category || null,
          image: article.image || null,
        });
      }

      // Save news to storage
      await storage.addNewsMany(processedArticles);
      console.log(`📰 Saved ${processedArticles.length} news articles`);

      // Add new tickers to watchlist if they're not already there
      if (newTickers.size > 0) {
        console.log(`📊 Found ${newTickers.size} ticker symbols in news`);
        await this.addTickersToWatchlist(Array.from(newTickers));
      }

    } catch (error) {
      console.error("📰 Error fetching news:", error);
    }
  }

  private async addTickersToWatchlist(tickers: string[]) {
    const existingStocks = await storage.getStocks();
    const existingSymbols = new Set(existingStocks.map(s => s.symbol));

    let addedCount = 0;

    for (const ticker of tickers) {
      const symbol = ticker.toUpperCase();
      
      // Skip if already in watchlist
      if (existingSymbols.has(symbol)) {
        continue;
      }

      try {
        // Get company info
        const companyInfo = await financialDataClient.getCompanyInfo(symbol);
        
        // Get initial quote
        const quote = await financialDataClient.getQuote(symbol);

        const stockData: InsertStock = {
          symbol,
          companyName: companyInfo?.name || symbol,
          currentPrice: quote?.currentPrice || null,
          previousClose: quote?.previousClose || null,
          volume: quote?.volume || null,
          avgVolume: quote?.volume || null, // Initial avgVolume = current volume
        };

        await storage.addStock(stockData);
        addedCount++;
        console.log(`✅ Added ${symbol} to watchlist`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error adding ${symbol} to watchlist:`, error);
      }
    }

    if (addedCount > 0) {
      console.log(`📊 Added ${addedCount} new stocks to watchlist`);
    }
  }

  getStatus(): { isRunning: boolean; intervalSeconds: number } {
    return {
      isRunning: this.isRunning,
      intervalSeconds: 45, // Will be updated from settings
    };
  }
}

export const newsFetcher = new NewsFetcherService();
