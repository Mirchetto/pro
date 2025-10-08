import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "active" | "connecting" | "disconnected";
  label?: string;
  className?: string;
}

export default function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      color: "bg-positive",
      text: "Live",
      animate: true,
    },
    connecting: {
      color: "bg-warning",
      text: "Connecting",
      animate: true,
    },
    disconnected: {
      color: "bg-negative",
      text: "Disconnected",
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid={`status-${status}`}>
      <div className="relative">
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        {config.animate && (
          <div className={cn("absolute inset-0 h-2 w-2 rounded-full animate-ping", config.color, "opacity-75")} />
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {label || config.text}
      </span>
    </div>
  );
}
