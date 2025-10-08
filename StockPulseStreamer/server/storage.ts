import { 
  type User, 
  type InsertUser,
  type Stock,
  type InsertStock,
  type BoomStock,
  type InsertBoomStock,
  type News,
  type InsertNews,
  type PriceHistory,
  type InsertPriceHistory,
  type AlertSettings,
  type InsertAlertSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Stock watchlist methods
  getStocks(): Promise<Stock[]>;
  getStock(symbol: string): Promise<Stock | undefined>;
  addStock(stock: InsertStock): Promise<Stock>;
  removeStock(symbol: string): Promise<boolean>;
  updateStock(symbol: string, updates: Partial<Stock>): Promise<Stock | undefined>;

  // Boom stocks methods
  getBoomStocks(): Promise<BoomStock[]>;
  getActiveBoomStocks(): Promise<BoomStock[]>;
  getBoomStock(id: string): Promise<BoomStock | undefined>;
  addBoomStock(boomStock: InsertBoomStock): Promise<BoomStock>;
  updateBoomStock(id: string, updates: Partial<BoomStock>): Promise<BoomStock | undefined>;
  expireBoomStock(id: string): Promise<boolean>;
  cleanupExpiredBoomStocks(): Promise<void>;

  // News methods
  getNews(limit?: number): Promise<News[]>;
  getNewsByTicker(ticker: string, limit?: number): Promise<News[]>;
  addNews(news: InsertNews): Promise<News>;
  addNewsMany(newsList: InsertNews[]): Promise<News[]>;

  // Price history methods
  getPriceHistory(symbol: string, limit?: number): Promise<PriceHistory[]>;
  addPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  getLatestPrice(symbol: string): Promise<PriceHistory | undefined>;

  // Alert settings methods
  getAlertSettings(): Promise<AlertSettings>;
  updateAlertSettings(settings: Partial<InsertAlertSettings>): Promise<AlertSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stocks: Map<string, Stock>;
  private boomStocks: Map<string, BoomStock>;
  private news: News[];
  private priceHistory: Map<string, PriceHistory[]>;
  private alertSettings: AlertSettings;

  constructor() {
    this.users = new Map();
    this.stocks = new Map();
    this.boomStocks = new Map();
    this.news = [];
    this.priceHistory = new Map();
    
    // Default alert settings
    this.alertSettings = {
      id: randomUUID(),
      priceChangeThreshold: 3.0,
      volumeRatioThreshold: 1.5,
      trackingDurationMinutes: 5,
      newsFetchIntervalSeconds: 45,
      priceCheckIntervalSeconds: 10,
      telegramEnabled: false,
      desktopEnabled: true,
    };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Stock watchlist methods
  async getStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(symbol: string): Promise<Stock | undefined> {
    return this.stocks.get(symbol.toUpperCase());
  }

  async addStock(insertStock: InsertStock): Promise<Stock> {
    const symbol = insertStock.symbol.toUpperCase();
    const existing = this.stocks.get(symbol);
    
    if (existing) {
      return existing;
    }

    const stock: Stock = {
      id: randomUUID(),
      symbol,
      companyName: insertStock.companyName ?? null,
      addedAt: new Date(),
      currentPrice: insertStock.currentPrice ?? null,
      previousClose: insertStock.previousClose ?? null,
      volume: insertStock.volume ?? null,
      avgVolume: insertStock.avgVolume ?? null,
    };

    this.stocks.set(symbol, stock);
    return stock;
  }

  async removeStock(symbol: string): Promise<boolean> {
    return this.stocks.delete(symbol.toUpperCase());
  }

  async updateStock(symbol: string, updates: Partial<Stock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (!stock) return undefined;

    const updated = { ...stock, ...updates };
    this.stocks.set(symbol.toUpperCase(), updated);
    return updated;
  }

  // Boom stocks methods
  async getBoomStocks(): Promise<BoomStock[]> {
    return Array.from(this.boomStocks.values());
  }

  async getActiveBoomStocks(): Promise<BoomStock[]> {
    const now = new Date();
    return Array.from(this.boomStocks.values()).filter(
      (boom) => boom.isActive && boom.expiresAt > now
    );
  }

  async getBoomStock(id: string): Promise<BoomStock | undefined> {
    return this.boomStocks.get(id);
  }

  async addBoomStock(insertBoomStock: InsertBoomStock): Promise<BoomStock> {
    const id = randomUUID();
    const boomStock: BoomStock = {
      id,
      symbol: insertBoomStock.symbol,
      companyName: insertBoomStock.companyName ?? null,
      boomDetectedAt: new Date(),
      expiresAt: insertBoomStock.expiresAt,
      triggerPrice: insertBoomStock.triggerPrice,
      currentPrice: insertBoomStock.currentPrice,
      priceChange: insertBoomStock.priceChange,
      volume: insertBoomStock.volume,
      avgVolume: insertBoomStock.avgVolume,
      volumeRatio: insertBoomStock.volumeRatio,
      peakPrice: insertBoomStock.peakPrice ?? null,
      peakPriceChange: insertBoomStock.peakPriceChange ?? null,
      isActive: insertBoomStock.isActive ?? true,
    };

    this.boomStocks.set(id, boomStock);
    return boomStock;
  }

  async updateBoomStock(id: string, updates: Partial<BoomStock>): Promise<BoomStock | undefined> {
    const boomStock = this.boomStocks.get(id);
    if (!boomStock) return undefined;

    const updated = { ...boomStock, ...updates };
    this.boomStocks.set(id, updated);
    return updated;
  }

  async expireBoomStock(id: string): Promise<boolean> {
    const boomStock = this.boomStocks.get(id);
    if (!boomStock) return false;

    const updated = { ...boomStock, isActive: false };
    this.boomStocks.set(id, updated);
    return true;
  }

  async cleanupExpiredBoomStocks(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.boomStocks.entries());
    for (const [id, boomStock] of entries) {
      if (boomStock.expiresAt < now && boomStock.isActive) {
        await this.expireBoomStock(id);
      }
    }
  }

  // News methods
  async getNews(limit: number = 50): Promise<News[]> {
    return this.news
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async getNewsByTicker(ticker: string, limit: number = 20): Promise<News[]> {
    const upperTicker = ticker.toUpperCase();
    return this.news
      .filter((article) => 
        article.tickers?.some(t => t.toUpperCase() === upperTicker)
      )
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async addNews(insertNews: InsertNews): Promise<News> {
    const newsItem: News = {
      id: randomUUID(),
      ...insertNews,
      fetchedAt: new Date(),
      tickers: insertNews.tickers ?? null,
      summary: insertNews.summary ?? null,
      category: insertNews.category ?? null,
      image: insertNews.image ?? null,
    };

    // Avoid duplicates based on URL
    const exists = this.news.some((n) => n.url === newsItem.url);
    if (!exists) {
      this.news.push(newsItem);
      // Keep only last 500 news items
      if (this.news.length > 500) {
        this.news = this.news
          .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
          .slice(0, 500);
      }
    }

    return newsItem;
  }

  async addNewsMany(newsList: InsertNews[]): Promise<News[]> {
    const added: News[] = [];
    for (const news of newsList) {
      const item = await this.addNews(news);
      added.push(item);
    }
    return added;
  }

  // Price history methods
  async getPriceHistory(symbol: string, limit: number = 100): Promise<PriceHistory[]> {
    const history = this.priceHistory.get(symbol.toUpperCase()) || [];
    return history
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async addPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const symbol = insertHistory.symbol.toUpperCase();
    const history: PriceHistory = {
      id: randomUUID(),
      ...insertHistory,
      symbol,
      timestamp: new Date(),
      change: insertHistory.change ?? null,
      volumeRatio: insertHistory.volumeRatio ?? null,
    };

    const existing = this.priceHistory.get(symbol) || [];
    existing.push(history);
    
    // Keep only last 1000 entries per symbol
    if (existing.length > 1000) {
      existing.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.priceHistory.set(symbol, existing.slice(0, 1000));
    } else {
      this.priceHistory.set(symbol, existing);
    }

    return history;
  }

  async getLatestPrice(symbol: string): Promise<PriceHistory | undefined> {
    const history = this.priceHistory.get(symbol.toUpperCase()) || [];
    if (history.length === 0) return undefined;
    
    return history.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  // Alert settings methods
  async getAlertSettings(): Promise<AlertSettings> {
    return this.alertSettings;
  }

  async updateAlertSettings(settings: Partial<InsertAlertSettings>): Promise<AlertSettings> {
    this.alertSettings = {
      ...this.alertSettings,
      ...settings,
    };
    return this.alertSettings;
  }
}

export const storage = new MemStorage();
