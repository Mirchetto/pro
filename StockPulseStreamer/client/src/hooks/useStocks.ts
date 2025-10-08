import { useQuery } from "@tanstack/react-query";
import type { Stock, BoomStock, News, PriceHistory, AlertSettings } from "@shared/schema";

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function useStocks() {
  return useQuery<Stock[]>({
    queryKey: ["stocks"],
    queryFn: () => fetchAPI<Stock[]>("/stocks"),
    refetchInterval: 10000,
  });
}

export function useBoomStocks() {
  return useQuery<BoomStock[]>({
    queryKey: ["boomStocks"],
    queryFn: () => fetchAPI<BoomStock[]>("/boom-stocks"),
    refetchInterval: 10000,
  });
}

export function useNews(limit?: number) {
  return useQuery<News[]>({
    queryKey: ["news", limit],
    queryFn: () => fetchAPI<News[]>(`/news${limit ? `?limit=${limit}` : ""}`),
    refetchInterval: 30000,
  });
}

export function useNewsByTicker(ticker: string, limit?: number) {
  return useQuery<News[]>({
    queryKey: ["news", ticker, limit],
    queryFn: () => fetchAPI<News[]>(`/news/ticker/${ticker}${limit ? `?limit=${limit}` : ""}`),
    enabled: !!ticker,
  });
}

export function usePriceHistory(symbol: string, limit?: number) {
  return useQuery<PriceHistory[]>({
    queryKey: ["priceHistory", symbol, limit],
    queryFn: () => fetchAPI<PriceHistory[]>(`/price-history/${symbol}${limit ? `?limit=${limit}` : ""}`),
    enabled: !!symbol,
  });
}

export function useSettings() {
  return useQuery<AlertSettings>({
    queryKey: ["settings"],
    queryFn: () => fetchAPI<AlertSettings>("/settings"),
  });
}

export function useStatus() {
  return useQuery({
    queryKey: ["status"],
    queryFn: () => fetchAPI<{ newsFetcher: { isRunning: boolean; intervalSeconds: number }; marketMonitor: { isRunning: boolean; intervalSeconds: number; trackedSymbols: number } }>("/status"),
    refetchInterval: 5000,
  });
}
