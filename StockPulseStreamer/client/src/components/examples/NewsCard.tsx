import NewsCard from '../NewsCard';

export default function NewsCardExample() {
  return (
    <div className="p-8 space-y-4 max-w-4xl">
      <NewsCard
        title="Tech stocks rally on strong earnings reports"
        source="Reuters"
        timestamp={new Date(Date.now() - 300000)}
        tickers={["AAPL", "MSFT", "GOOGL"]}
        sentiment="positive"
        url="https://example.com"
      />
      <NewsCard
        title="Federal Reserve announces interest rate decision"
        source="Bloomberg"
        timestamp={new Date(Date.now() - 600000)}
        tickers={["SPY", "QQQ"]}
        sentiment="neutral"
      />
    </div>
  );
}
