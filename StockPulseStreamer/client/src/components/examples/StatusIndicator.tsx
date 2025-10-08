import StatusIndicator from '../StatusIndicator';

export default function StatusIndicatorExample() {
  return (
    <div className="p-8 space-y-4">
      <StatusIndicator status="active" />
      <StatusIndicator status="connecting" />
      <StatusIndicator status="disconnected" />
    </div>
  );
}
