import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClaimStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  timestamp: string;
  message: string;
}

interface StatusSidebarProps {
  claims?: ClaimStatus[];
}

export default function StatusSidebar({ claims = [] }: StatusSidebarProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-chart-2 text-white";
      case "error":
        return "bg-destructive text-destructive-foreground";
      case "processing":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-chart-3 text-white";
    }
  };

  return (
    <div className="h-screen w-full bg-sidebar border-r border-sidebar-border p-6 overflow-y-auto">
      <div className="sticky top-0 bg-sidebar pb-4 mb-6">
        <h2 className="text-xl font-semibold text-sidebar-foreground">Status Overview</h2>
      </div>
      
      {claims.length === 0 ? (
        <p className="text-muted-foreground text-sm">No active requests</p>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-4 rounded-md bg-card border border-card-border hover-elevate"
              data-testid={`status-claim-${claim.id}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <Badge className={`${getStatusColor(claim.status)} flex items-center gap-1.5`}>
                  {getStatusIcon(claim.status)}
                  <span className="capitalize">{claim.status}</span>
                </Badge>
              </div>
              <p className="text-sm text-card-foreground mb-2">{claim.message}</p>
              <p className="text-xs text-muted-foreground">{claim.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
