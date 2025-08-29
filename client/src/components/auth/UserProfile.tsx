import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Calendar, 
  Cloud, 
  HardDrive, 
  LogOut, 
  Settings,
  Loader2
} from 'lucide-react';
import { toolRepo } from '../../../../src/repositories';
import { useQuery } from '@tanstack/react-query';

export function UserProfile() {
  const { user, signOut, isLoading } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: cloudAvailable } = useQuery({
    queryKey: ['cloud-status'],
    queryFn: () => toolRepo.isCloudAvailable(),
    refetchInterval: 30000 // Check every 30 seconds
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          No user signed in
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl" data-testid="user-profile">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Profile</CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </div>
          </div>
          <Badge variant={cloudAvailable ? "default" : "secondary"}>
            {cloudAvailable ? (
              <>
                <Cloud className="mr-1 h-3 w-3" />
                Cloud Connected
              </>
            ) : (
              <>
                <HardDrive className="mr-1 h-3 w-3" />
                Local Only
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Account Information
          </h3>
          
          <div className="grid gap-3">
            <div className="flex items-center space-x-3" data-testid="user-email">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Email Address</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3" data-testid="user-id">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-mono text-muted-foreground">{user.id.slice(0, 8)}...</p>
                <p className="text-xs text-muted-foreground">User ID</p>
              </div>
            </div>
            
            {user.created_at && (
              <div className="flex items-center space-x-3" data-testid="user-created">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Storage Status */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Storage & Sync
          </h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cloud Storage</p>
                  <p className="text-xs text-muted-foreground">
                    {cloudAvailable ? 'Connected and syncing' : 'Not available in development'}
                  </p>
                </div>
              </div>
              <Badge variant={cloudAvailable ? "default" : "secondary"}>
                {cloudAvailable ? 'Active' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Local Storage</p>
                  <p className="text-xs text-muted-foreground">
                    Browser storage for offline access
                  </p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            data-testid="button-settings"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            disabled={isSigningOut || isLoading}
            className="flex-1"
            data-testid="button-signout"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}