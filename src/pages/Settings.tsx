
import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/CustomButton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Save, 
  Moon, 
  Sun, 
  Bell, 
  BellOff, 
  Globe, 
  Key,
  CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Theme settings
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [consultationReminders, setConsultationReminders] = useState(true);
  
  // AI settings
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  
  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    
    // Update document class
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const handleSaveNotifications = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Notification preferences saved",
      });
      setIsSaving(false);
    }, 1000);
  };
  
  const handleSaveApiKey = () => {
    setIsSaving(true);
    
    try {
      // Store API key in local storage
      localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
      
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-neutral-50 dark:bg-neutral-900">
          <div className="container px-4 py-8">
            <div className="flex flex-col">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Manage your application preferences
                </p>
              </div>
              
              <div className="space-y-8">
                <Tabs defaultValue="appearance" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="appearance">
                    <Card>
                      <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                          Customize the appearance of the application
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Theme</Label>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Choose between dark and light theme
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Sun className={`h-5 w-5 ${!darkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <Switch 
                              checked={darkMode}
                              onCheckedChange={handleThemeChange}
                            />
                            <Moon className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-gray-400'}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="notifications">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>
                          Manage your notification preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Receive important updates via email
                            </div>
                          </div>
                          <Switch 
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base">Consultation Reminders</Label>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Get reminders about upcoming consultations
                            </div>
                          </div>
                          <Switch 
                            checked={consultationReminders}
                            onCheckedChange={setConsultationReminders}
                          />
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <CustomButton
                            variant="primary"
                            size="md"
                            onClick={handleSaveNotifications}
                            disabled={isSaving}
                            className="gap-2"
                          >
                            {isSaving ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save Preferences
                              </>
                            )}
                          </CustomButton>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="integrations">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Integration</CardTitle>
                        <CardDescription>
                          Configure your AI assistant settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="geminiApiKey">Google Gemini API Key</Label>
                            <div className="flex items-center space-x-2">
                              <Input 
                                id="geminiApiKey"
                                type="password"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                className="flex-1"
                              />
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('https://ai.google.dev/tutorials/setup', '_blank')}
                              >
                                Get Key
                              </CustomButton>
                            </div>
                            <p className="text-sm text-gray-500">
                              Used for enhancing clinical notes with AI
                            </p>
                          </div>
                          
                          {geminiApiKey && (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              API key is configured
                            </div>
                          )}
                          
                          <div className="flex justify-end pt-4">
                            <CustomButton
                              variant="primary"
                              size="md"
                              onClick={handleSaveApiKey}
                              disabled={isSaving || !geminiApiKey}
                              className="gap-2"
                            >
                              {isSaving ? (
                                <>Saving...</>
                              ) : (
                                <>
                                  <Key className="h-4 w-4" />
                                  Save API Key
                                </>
                              )}
                            </CustomButton>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
