import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { GeneralTab } from './GeneralTab';
import { ThemesTab } from './ThemesTab';
import { KeyboardTab } from './KeyboardTab';
import { AnalyticsTab } from './AnalyticsTab';
import { PrivacyTab } from './PrivacyTab';

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-8" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience and manage your account
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-5 h-auto p-0">
                <TabsTrigger 
                  value="general" 
                  className="rounded-none border-r data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background"
                >
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="themes" 
                  className="rounded-none border-r data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background"
                >
                  Themes
                </TabsTrigger>
                <TabsTrigger 
                  value="keyboard" 
                  className="rounded-none border-r data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background"
                >
                  Keyboard
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="rounded-none border-r data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-background"
                >
                  Privacy
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="general" className="mt-0">
                <GeneralTab />
              </TabsContent>
              
              <TabsContent value="themes" className="mt-0">
                <ThemesTab />
              </TabsContent>
              
              <TabsContent value="keyboard" className="mt-0">
                <KeyboardTab />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <AnalyticsTab />
              </TabsContent>
              
              <TabsContent value="privacy" className="mt-0">
                <PrivacyTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}