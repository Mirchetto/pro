import PriceChange from '../PriceChange';

export default function PriceChangeExample() {
  return (
    <div className="p-8 space-y-4">
      <PriceChange value={5.2} />
      <PriceChange value={-3.1} />
      <PriceChange value={0} />
      <PriceChange value={8.5} format="text" />
      <PriceChange value={-2.3} format="text" />
    </div>
  );
}
