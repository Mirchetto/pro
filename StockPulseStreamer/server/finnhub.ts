import type { News } from "@shared/schema";

interface FinnhubQuote {
  c: number;  // Current price
  h: number;  // High
  l: number;  // Low
  o: number;  // Open
  pc: number; // Previous close
  t: number;  // Timestamp
}

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface PolygonSnapshot {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  day?: {
    c: number; // Close
    h: number; // High
    l: number; // Low
    o: number; // Open
    v: number; // Volume
    vw: number; // Volume weighted
  };
  prevDay?: {
    c: number;
    v: number;
  };
}

interface PolygonNews {
  title: string;
  description: string;
  author: string;
  published_utc: string;
  article_url: string;
  image_url: string;
  tickers: string[];
  publisher: {
    name: string;
  };
}

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const POLYGON_BASE_URL = "https://api.polygon.io";

class FinancialDataClient {
  private finnhubKey: string | undefined;
  private polygonKey: string | undefined;
  private useFinnhub: boolean = true;

  constructor() {
    this.finnhubKey = process.env.FINNHUB_API_KEY;
    this.polygonKey = process.env.POLYGON_API_KEY;

    // Prefer Finnhub if available, otherwise use Polygon
    if (!this.finnhubKey && this.polygonKey) {
      this.useFinnhub = false;
      console.log("⚠️ Using Polygon.io as primary data source (Finnhub key not found)");
    } else if (!this.finnhubKey && !this.polygonKey) {
      console.warn("⚠️ No API keys found! Set FINNHUB_API_KEY or POLYGON_API_KEY");
    }
  }

  async getQuote(symbol: string): Promise<{
    currentPrice: number;
    previousClose: number;
    volume: number;
    change: number;
    changePercent: number;
  } | null> {
    if (this.useFinnhub && this.finnhubKey) {
      try {
        const response = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${this.finnhubKey}`
        );
        
        if (!response.ok) {
          throw new Error(`Finnhub API error: ${response.status}`);
        }

        const data: FinnhubQuote = await response.json();
        
        if (data.c === 0) return null; // No data available

        const change = data.c - data.pc;
        const changePercent = (change / data.pc) * 100;

        return {
          currentPrice: data.c,
          previousClose: data.pc,
          volume: 0, // Finnhub quote doesn't include volume, need separate call
          change,
          changePercent,
        };
      } catch (error) {
        console.error("Finnhub quote error:", error);
        // Fallback to Polygon
        if (this.polygonKey) {
          return this.getQuoteFromPolygon(symbol);
        }
        return null;
      }
    } else if (this.polygonKey) {
      return this.getQuoteFromPolygon(symbol);
    }

    return null;
  }

  private async getQuoteFromPolygon(symbol: string): Promise<{
    currentPrice: number;
    previousClose: number;
    volume: number;
    change: number;
    changePercent: number;
  } | null> {
    try {
      const response = await fetch(
        `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${this.polygonKey}`
      );

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`);
      }

      const data = await response.json();
      const ticker: PolygonSnapshot = data.ticker;

      if (!ticker.day || !ticker.prevDay) return null;

      const change = ticker.day.c - ticker.prevDay.c;
      const changePercent = (change / ticker.prevDay.c) * 100;

      return {
        currentPrice: ticker.day.c,
        previousClose: ticker.prevDay.c,
        volume: ticker.day.v,
        change,
        changePercent,
      };
    } catch (error) {
      console.error("Polygon quote error:", error);
      return null;
    }
  }

  async getNews(limit: number = 50): Promise<Partial<News>[]> {
    if (this.polygonKey) {
      try {
        const news = await this.getNewsFromPolygon(limit);
        if (news.length > 0) {
          return news;
        }
        throw new Error("Polygon returned no news");
      } catch (error) {
        console.error("Polygon news error:", error);
        if (this.finnhubKey) {
          console.log("⚠️ Falling back to Finnhub for news");
          return this.getNewsFromFinnhub(limit);
        }
        return [];
      }
    } else if (this.finnhubKey) {
      return this.getNewsFromFinnhub(limit);
    }

    return [];
  }

  private async getNewsFromFinnhub(limit: number = 50): Promise<Partial<News>[]> {
    try {
      const response = await fetch(
        `${FINNHUB_BASE_URL}/news?category=general&token=${this.finnhubKey}`
      );

      if (!response.ok) {
        throw new Error(`Finnhub news error: ${response.status}`);
      }

      const data: FinnhubNews[] = await response.json();

      return data.slice(0, limit).map(article => ({
        headline: article.headline,
        summary: article.summary,
        source: article.source,
        url: article.url,
        publishedAt: new Date(article.datetime * 1000),
        tickers: article.related ? [article.related] : [],
        category: article.category,
        image: article.image,
      }));
    } catch (error) {
      console.error("Finnhub news error:", error);
      return [];
    }
  }

  private async getNewsFromPolygon(limit: number = 50): Promise<Partial<News>[]> {
    try {
      const response = await fetch(
        `${POLYGON_BASE_URL}/v2/reference/news?limit=${limit}&apiKey=${this.polygonKey}`
      );

      if (!response.ok) {
        throw new Error(`Polygon news error: ${response.status}`);
      }

      const data = await response.json();
      const articles: PolygonNews[] = data.results || [];

      return articles.map(article => ({
        headline: article.title,
        summary: article.description,
        source: article.publisher.name,
        url: article.article_url,
        publishedAt: new Date(article.published_utc),
        tickers: article.tickers || [],
        category: "general",
        image: article.image_url,
      }));
    } catch (error) {
      console.error("Polygon news error:", error);
      return [];
    }
  }

  async getCompanyInfo(symbol: string): Promise<{ name: string } | null> {
    if (this.useFinnhub && this.finnhubKey) {
      try {
        const response = await fetch(
          `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${this.finnhubKey}`
        );

        if (!response.ok) {
          throw new Error(`Finnhub profile error: ${response.status}`);
        }

        const data = await response.json();
        return { name: data.name || symbol };
      } catch (error) {
        console.error("Finnhub company info error:", error);
        return { name: symbol };
      }
    } else if (this.polygonKey) {
      try {
        const response = await fetch(
          `${POLYGON_BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${this.polygonKey}`
        );

        if (!response.ok) {
          throw new Error(`Polygon ticker details error: ${response.status}`);
        }

        const data = await response.json();
        return { name: data.results?.name || symbol };
      } catch (error) {
        console.error("Polygon company info error:", error);
        return { name: symbol };
      }
    }

    return { name: symbol };
  }

  // Extract ticker symbols from text (news headlines/summaries)
  extractTickers(text: string): string[] {
    // Match common stock ticker patterns: $AAPL, AAPL, (NASDAQ:AAPL), etc.
    const patterns = [
      /\$([A-Z]{1,5})\b/g,           // $AAPL
      /\b([A-Z]{2,5})\b/g,            // AAPL (2-5 uppercase letters)
      /\(([A-Z]+):([A-Z]{1,5})\)/g,   // (NASDAQ:AAPL)
    ];

    const tickers = new Set<string>();
    const commonWords = ['NYSE', 'NASDAQ', 'CEO', 'CFO', 'IPO', 'ETF', 'SEC', 'FDA', 'AI', 'AR', 'VR', 'IT', 'US', 'UK'];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const ticker = match[1] || match[2];
        // Filter out common words that match the pattern
        if (ticker && !commonWords.includes(ticker) && ticker.length >= 2 && ticker.length <= 5) {
          tickers.add(ticker);
        }
      }
    }

    return Array.from(tickers);
  }

  isConfigured(): boolean {
    return !!(this.finnhubKey || this.polygonKey);
  }
}

export const financialDataClient = new FinancialDataClient();
