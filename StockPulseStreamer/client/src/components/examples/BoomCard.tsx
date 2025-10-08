import BoomCard from '../BoomCard';

export default function BoomCardExample() {
  return (
    <div className="p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <BoomCard 
        ticker="GME"
        price={24.50}
        change={8.5}
        volumeMultiplier={3.2}
        onViewDetails={() => console.log('View details clicked')}
      />
      <BoomCard 
        ticker="AMC"
        price={6.85}
        change={5.2}
        volumeMultiplier={2.4}
        onViewDetails={() => console.log('View details clicked')}
      />
    </div>
  );
}
