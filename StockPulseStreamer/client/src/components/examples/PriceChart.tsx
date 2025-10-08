import PriceChart from '../PriceChart';

export default function PriceChartExample() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    time: `${i}:00`,
    price: 24.5 + Math.random() * 2 - 1,
  }));

  return (
    <div className="p-8 space-y-8">
      <div className="h-64">
        <PriceChart data={data} color="hsl(var(--positive))" />
      </div>
      <div className="h-64">
        <PriceChart data={data} color="hsl(var(--negative))" showArea={false} />
      </div>
    </div>
  );
}
