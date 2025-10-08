import TickerSymbol from '../TickerSymbol';

export default function TickerSymbolExample() {
  return (
    <div className="p-8 space-y-4">
      <TickerSymbol symbol="AAPL" size="sm" />
      <TickerSymbol symbol="TSLA" size="md" />
      <TickerSymbol symbol="NVDA" size="lg" />
    </div>
  );
}
