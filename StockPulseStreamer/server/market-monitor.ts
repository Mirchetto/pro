import { financialDataClient } from "./finnhub";
import { storage } from "./storage";
import { telegramNotifier } from "./telegram-notifier";
import type { InsertBoomStock, InsertPriceHistory } from "@shared/schema";

class MarketMonitorService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private trackingStocks = new Map<string, { startPrice: number; startVolume: number; startedAt: Date }>();

  async start() {
    if (this.isRunning) {
      console.log("📊 Market monitor already running");
      return;
    }

    const settings = await storage.getAlertSettings();
    const intervalMs = settings.priceCheckIntervalSeconds * 1000;

    console.log(`📊 Starting market monitor (interval: ${settings.priceCheckIntervalSeconds}s)`);

    this.isRunning = true;

    await this.monitorMarket();

    this.intervalId = setInterval(async () => {
      await this.monitorMarket();
    }, intervalMs);
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.trackingStocks.clear();
    console.log("📊 Market monitor stopped");
  }

  private async monitorMarket() {
    try {
      await storage.cleanupExpiredBoomStocks();

      const stocks = await storage.getStocks();
      const settings = await storage.getAlertSettings();
      const now = new Date();

      for (const stock of stocks) {
        try {
          const quote = await financialDataClient.getQuote(stock.symbol);

          if (!quote) {
            console.log(`⚠️ No quote data for ${stock.symbol}`);
            continue;
          }

          const currentPrice = quote.currentPrice;
          const volume = quote.volume || 0;
          const previousClose = stock.previousClose || quote.previousClose;
          const avgVolume = stock.avgVolume || volume;

          await storage.updateStock(stock.symbol, {
            currentPrice,
            previousClose,
            volume,
          });

          const priceChange = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
          const volumeRatio = avgVolume > 0 ? volume / avgVolume : 0;

          const priceHistory: InsertPriceHistory = {
            symbol: stock.symbol,
            price: currentPrice,
            volume: volume,
            change: priceChange,
            volumeRatio: volumeRatio,
          };
          await storage.addPriceHistory(priceHistory);

          if (!this.trackingStocks.has(stock.symbol)) {
            this.trackingStocks.set(stock.symbol, {
              startPrice: currentPrice,
              startVolume: volume,
              startedAt: now,
            });
          }

          const tracking = this.trackingStocks.get(stock.symbol);
          if (!tracking) continue;

          const trackingDurationMs = settings.trackingDurationMinutes * 60 * 1000;
          const timeElapsed = now.getTime() - tracking.startedAt.getTime();

          if (timeElapsed > trackingDurationMs) {
            console.log(`⏰ Tracking period expired for ${stock.symbol}, resetting`);
            this.trackingStocks.set(stock.symbol, {
              startPrice: currentPrice,
              startVolume: volume,
              startedAt: now,
            });
            continue;
          }

          const isBoomConditionMet =
            priceChange >= settings.priceChangeThreshold &&
            volumeRatio >= settings.volumeRatioThreshold;

          if (isBoomConditionMet) {
            const existingBooms = await storage.getActiveBoomStocks();
            const alreadyBooming = existingBooms.some(b => b.symbol === stock.symbol);

            if (!alreadyBooming) {
              console.log(`🚀 BOOM DETECTED for ${stock.symbol}! Price: +${priceChange.toFixed(2)}%, Volume: ${volumeRatio.toFixed(2)}x`);

              const expiresAt = new Date(now.getTime() + trackingDurationMs);
              const boomStock: InsertBoomStock = {
                symbol: stock.symbol,
                companyName: stock.companyName,
                expiresAt: expiresAt,
                triggerPrice: tracking.startPrice,
                currentPrice: currentPrice,
                priceChange: priceChange,
                volume: volume,
                avgVolume: avgVolume,
                volumeRatio: volumeRatio,
                peakPrice: currentPrice,
                peakPriceChange: priceChange,
                isActive: true,
              };

              await storage.addBoomStock(boomStock);

              await telegramNotifier.sendBoomAlert({
                symbol: stock.symbol,
                companyName: stock.companyName,
                currentPrice: currentPrice,
                priceChange: priceChange,
                volumeRatio: volumeRatio,
                triggerPrice: tracking.startPrice,
              });

              console.log(`✅ ${stock.symbol} added to Boom stocks (expires at ${expiresAt.toISOString()})`);
            } else {
              const boom = existingBooms.find(b => b.symbol === stock.symbol);
              if (boom) {
                const shouldUpdate = currentPrice > (boom.peakPrice || 0);
                if (shouldUpdate) {
                  await storage.updateBoomStock(boom.id, {
                    currentPrice: currentPrice,
                    priceChange: priceChange,
                    volume: volume,
                    volumeRatio: volumeRatio,
                    peakPrice: currentPrice,
                    peakPriceChange: priceChange,
                  });
                } else {
                  await storage.updateBoomStock(boom.id, {
                    currentPrice: currentPrice,
                    priceChange: priceChange,
                    volume: volume,
                    volumeRatio: volumeRatio,
                  });
                }
              }
            }
          }

          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`❌ Error monitoring ${stock.symbol}:`, error);
        }
      }

    } catch (error) {
      console.error("📊 Market monitor error:", error);
    }
  }

  getStatus(): { isRunning: boolean; intervalSeconds: number; trackedSymbols: number } {
    return {
      isRunning: this.isRunning,
      intervalSeconds: 10,
      trackedSymbols: this.trackingStocks.size,
    };
  }
}

export const marketMonitor = new MarketMonitorService();
