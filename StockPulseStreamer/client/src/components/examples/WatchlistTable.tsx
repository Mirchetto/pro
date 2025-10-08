import WatchlistTable from '../WatchlistTable';

export default function WatchlistTableExample() {
  const items = [
    { ticker: "AAPL", price: 178.45, change: 2.3, volume: 52000000, volumeMultiplier: 1.2, lastUpdate: new Date(Date.now() - 30000) },
    { ticker: "TSLA", price: 242.84, change: 4.7, volume: 98000000, volumeMultiplier: 1.8, lastUpdate: new Date(Date.now() - 45000) },
    { ticker: "NVDA", price: 495.22, change: -1.2, volume: 41000000, volumeMultiplier: 0.9, lastUpdate: new Date(Date.now() - 60000) },
  ];

  return (
    <div className="p-8">
      <WatchlistTable 
        items={items} 
        onTickerClick={(ticker) => console.log('Ticker clicked:', ticker)} 
      />
    </div>
  );
}
