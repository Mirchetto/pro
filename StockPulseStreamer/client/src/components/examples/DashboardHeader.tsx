import DashboardHeader from '../DashboardHeader';

export default function DashboardHeaderExample() {
  return (
    <DashboardHeader 
      status="active"
      onRefresh={() => console.log('Refresh clicked')}
      onSettings={() => console.log('Settings clicked')}
      alertCount={3}
    />
  );
}
