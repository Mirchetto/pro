import { RefreshCw, Settings, Bell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusIndicator from "./StatusIndicator";

interface DashboardHeaderProps {
  status: "active" | "connecting" | "disconnected";
  lastUpdate?: Date;
  onRefresh?: () => void;
  onSettings?: () => void;
  alertCount?: number;
}

export default function DashboardHeader({ 
  status, 
  lastUpdate, 
  onRefresh, 
  onSettings,
  alertCount = 0 
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Stock Boom Monitor
                </h1>
                <p className="text-sm text-muted-foreground">Real-time market alerts</p>
              </div>
            </div>
            <StatusIndicator status={status} />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRefresh}
              className="hover-elevate"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="relative hover-elevate"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-warning text-warning-foreground animate-pulse border-0"
                  data-testid="badge-alert-count"
                >
                  {alertCount}
                </Badge>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onSettings}
              className="hover-elevate"
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
