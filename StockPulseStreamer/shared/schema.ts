import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Watchlist stocks - stocks being monitored
export const stocks = pgTable("stocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(),
  companyName: text("company_name"),
  addedAt: timestamp("added_at").notNull().default(sql`now()`),
  currentPrice: real("current_price"),
  previousClose: real("previous_close"),
  volume: integer("volume"),
  avgVolume: integer("avg_volume"),
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  addedAt: true,
});

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

// Boom stocks - stocks that triggered boom conditions
export const boomStocks = pgTable("boom_stocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  companyName: text("company_name"),
  boomDetectedAt: timestamp("boom_detected_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(), // 5 minutes after detection
  triggerPrice: real("trigger_price").notNull(),
  currentPrice: real("current_price").notNull(),
  priceChange: real("price_change").notNull(), // percentage
  volume: integer("volume").notNull(),
  avgVolume: integer("avg_volume").notNull(),
  volumeRatio: real("volume_ratio").notNull(), // volume / avgVolume
  peakPrice: real("peak_price"),
  peakPriceChange: real("peak_price_change"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertBoomStockSchema = createInsertSchema(boomStocks).omit({
  id: true,
  boomDetectedAt: true,
});

export type InsertBoomStock = z.infer<typeof insertBoomStockSchema>;
export type BoomStock = typeof boomStocks.$inferSelect;

// News articles
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  headline: text("headline").notNull(),
  summary: text("summary"),
  source: text("source").notNull(),
  url: text("url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().default(sql`now()`),
  tickers: text("tickers").array(), // extracted ticker symbols
  category: text("category"),
  image: text("image"),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  fetchedAt: true,
});

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// Price history - for tracking price/volume changes
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  price: real("price").notNull(),
  volume: integer("volume").notNull(),
  change: real("change"), // percentage change from previous
  volumeRatio: real("volume_ratio"), // volume / avgVolume
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  timestamp: true,
});

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

// Alert settings
export const alertSettings = pgTable("alert_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  priceChangeThreshold: real("price_change_threshold").notNull().default(3.0), // 3% default
  volumeRatioThreshold: real("volume_ratio_threshold").notNull().default(1.5), // 1.5x default
  trackingDurationMinutes: integer("tracking_duration_minutes").notNull().default(5),
  newsFetchIntervalSeconds: integer("news_fetch_interval_seconds").notNull().default(45),
  priceCheckIntervalSeconds: integer("price_check_interval_seconds").notNull().default(10),
  telegramEnabled: boolean("telegram_enabled").notNull().default(false),
  desktopEnabled: boolean("desktop_enabled").notNull().default(true),
});

export const insertAlertSettingsSchema = createInsertSchema(alertSettings).omit({
  id: true,
});

export type InsertAlertSettings = z.infer<typeof insertAlertSettingsSchema>;
export type AlertSettings = typeof alertSettings.$inferSelect;
