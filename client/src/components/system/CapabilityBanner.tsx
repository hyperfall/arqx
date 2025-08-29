import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { featureFlags } from "../../../../src/config";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { 
  Cloud, 
  HardDrive, 
  Users, 
  Lock, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  Info,
  X
} from "lucide-react";

interface CapabilityBannerProps {
  className?: string;
  dismissible?: boolean;
  compact?: boolean;
}

export function CapabilityBanner({ 
  className = "", 
  dismissible = true, 
  compact = false 
}: CapabilityBannerProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [flags, setFlags] = useState(featureFlags.get());
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe(setFlags);
    return unsubscribe;
  }, []);

  // Don't show if dismissed
  if (isDismissed && dismissible) {
    return null;
  }

  const capabilities = {
    authentication: isAuthenticated,
    cloudStorage: flags.supabaseOn && isSupabaseConfigured,
    localStorage: true,
    localOnlyMode: flags.localOnlyMode,
    supabaseConfigured: isSupabaseConfigured,
  };

  const getStorageStatus = () => {
    if (flags.localOnlyMode) {
      return {
        type: "local-only" as const,
        message: "Local storage only - tools saved in browser",
        icon: HardDrive,
        variant: "secondary" as const,
      };
    }
    
    if (capabilities.cloudStorage && isAuthenticated) {
      return {
        type: "cloud-sync" as const,
        message: "Cloud sync active - tools saved to cloud and local",
        icon: Cloud,
        variant: "default" as const,
      };
    }
    
    if (capabilities.cloudStorage && !isAuthenticated) {
      return {
        type: "cloud-available" as const,
        message: "Cloud storage available - sign in to sync tools",
        icon: Wifi,
        variant: "secondary" as const,
      };
    }
    
    return {
      type: "offline" as const,
      message: "Offline mode - tools saved locally only",
      icon: WifiOff,
      variant: "secondary" as const,
    };
  };

  const getAuthStatus = () => {
    if (isAuthenticated) {
      return {
        message: `Signed in as ${user?.email}`,
        icon: CheckCircle,
        variant: "default" as const,
      };
    }
    
    if (capabilities.supabaseConfigured) {
      return {
        message: "Not signed in - local storage only",
        icon: Users,
        variant: "secondary" as const,
      };
    }
    
    return {
      message: "Authentication not configured",
      icon: Lock,
      variant: "secondary" as const,
    };
  };

  const storageStatus = getStorageStatus();
  const authStatus = getAuthStatus();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={storageStatus.variant} className="gap-1">
          <storageStatus.icon className="w-3 h-3" />
          {storageStatus.type === "local-only" ? "Local" : 
           storageStatus.type === "cloud-sync" ? "Synced" :
           storageStatus.type === "cloud-available" ? "Cloud" : "Offline"}
        </Badge>
        
        {isAuthenticated && (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Signed In
          </Badge>
        )}
        
        {flags.localOnlyMode && (
          <Badge variant="outline" className="gap-1">
            <Lock className="w-3 h-3" />
            Local Only
          </Badge>
        )}
      </div>
    );
  }

  // Determine overall status and alert variant
  const getAlertVariant = () => {
    if (flags.localOnlyMode) return "default";
    if (capabilities.cloudStorage && isAuthenticated) return "default";
    if (!capabilities.supabaseConfigured) return "default";
    return "default";
  };

  const getAlertIcon = () => {
    if (flags.localOnlyMode) return HardDrive;
    if (capabilities.cloudStorage && isAuthenticated) return CheckCircle;
    if (!capabilities.supabaseConfigured) return Info;
    return AlertTriangle;
  };

  const AlertIcon = getAlertIcon();
  
  return (
    <Alert variant={getAlertVariant() as "default" | "destructive"} className={`${className}`} data-testid="capability-banner">
      <AlertIcon className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <AlertDescription className="flex flex-col gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Storage Status */}
              <div className="flex items-center gap-2">
                <storageStatus.icon className="w-4 h-4" />
                <span className="text-sm">{storageStatus.message}</span>
              </div>
              
              {/* Auth Status (only show if relevant) */}
              {(capabilities.supabaseConfigured || isAuthenticated) && (
                <div className="flex items-center gap-2">
                  <authStatus.icon className="w-4 h-4" />
                  <span className="text-sm">{authStatus.message}</span>
                </div>
              )}
            </div>
            
            {/* Feature Flags */}
            <div className="flex items-center gap-2 flex-wrap">
              {flags.localOnlyMode && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Local-only mode
                </Badge>
              )}
              
              {!capabilities.supabaseConfigured && (
                <Badge variant="outline" className="gap-1">
                  <WifiOff className="w-3 h-3" />
                  Cloud disabled
                </Badge>
              )}
              
              {capabilities.supabaseConfigured && flags.supabaseOn && (
                <Badge variant="outline" className="gap-1">
                  <Cloud className="w-3 h-3" />
                  Cloud enabled
                </Badge>
              )}
            </div>
          </AlertDescription>
        </div>
        
        {/* Dismiss Button */}
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-auto p-1 ml-2"
            data-testid="dismiss-capability-banner"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

export default CapabilityBanner;