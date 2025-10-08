import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import TickerSymbol from "./TickerSymbol";
import PriceChange from "./PriceChange";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface WatchlistItem {
  ticker: string;
  price: number;
  change: number;
  volume: number;
  volumeMultiplier: number;
  lastUpdate: Date;
}

interface WatchlistTableProps {
  items: WatchlistItem[];
  onTickerClick?: (ticker: string) => void;
}

export default function WatchlistTable({ items, onTickerClick }: WatchlistTableProps) {
  return (
    <div className="border rounded-md" data-testid="watchlist-table">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-semibold text-sm">
                <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" data-testid="button-sort-ticker">
                  Symbol <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">Price</th>
              <th className="text-right p-4 font-semibold text-sm">
                <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" data-testid="button-sort-change">
                  Change <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </th>
              <th className="text-right p-4 font-semibold text-sm">Volume</th>
              <th className="text-right p-4 font-semibold text-sm">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr 
                key={item.ticker}
                className={cn(
                  "border-b last:border-0 hover-elevate cursor-pointer",
                  index % 2 === 0 && "bg-muted/20"
                )}
                onClick={() => onTickerClick?.(item.ticker)}
                data-testid={`row-watchlist-${item.ticker}`}
              >
                <td className="p-4">
                  <TickerSymbol symbol={item.ticker} />
                </td>
                <td className="p-4 text-right font-mono font-semibold">
                  ${item.price.toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end">
                    <PriceChange value={item.change} format="text" />
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm">{item.volume.toLocaleString()}</span>
                    <span className={cn(
                      "text-xs",
                      item.volumeMultiplier >= 1.5 ? "text-warning font-semibold" : "text-muted-foreground"
                    )}>
                      {item.volumeMultiplier.toFixed(1)}x avg
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(item.lastUpdate, { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
