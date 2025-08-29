import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { UserProfile } from '../components/auth/UserProfile';
import { AuthDialog } from '../components/auth/AuthDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { Link } from 'wouter';

export default function Profile() {
  const { isAuthenticated, checkAuthStatus, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="back-to-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="back-to-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to view your profile and manage your account settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthDialog />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6" data-testid="profile-page">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="back-to-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
      </div>

      {/* Main Profile Content */}
      <div className="flex justify-center">
        <UserProfile />
      </div>

      {/* Additional Profile Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>
              Your latest tool creations and modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Activity tracking will be available in a future update.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage Usage</CardTitle>
            <CardDescription>
              Local and cloud storage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Storage analytics will be available in a future update.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}