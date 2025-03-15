
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/CustomButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, BellRing, Monitor, Moon, Palette, Save, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface SettingsProfileData {
  first_name: string | null;
  last_name: string | null;
  specialty: string | null;
}

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<SettingsProfileData>({ first_name: '', last_name: '', specialty: '' });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, specialty')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setUserData({
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        specialty: data?.specialty || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update your profile",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          specialty: userData.specialty
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    // In a real app, save theme and notification preferences
    toast({
      title: "Success",
      description: "Preferences saved successfully",
    });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        
        <SidebarInset className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
          <div className="container px-4 py-8">
            <div className="flex flex-col space-y-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
              
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="w-full max-w-md bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                  <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
                  <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={userData.first_name || ''} 
                            onChange={(e) => setUserData({...userData, first_name: e.target.value})}
                            className="glass-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={userData.last_name || ''} 
                            onChange={(e) => setUserData({...userData, last_name: e.target.value})}
                            className="glass-input"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Medical Specialty</Label>
                        <Input 
                          id="specialty" 
                          value={userData.specialty || ''} 
                          onChange={(e) => setUserData({...userData, specialty: e.target.value})}
                          className="glass-input"
                        />
                      </div>
                      
                      <div className="pt-4">
                        <CustomButton 
                          type="button" 
                          variant="primary"
                          size="md"
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </CustomButton>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>
                        Customize how MedSync looks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <Palette className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Theme</p>
                              <p className="text-sm text-gray-500">Select your preferred theme</p>
                            </div>
                          </div>
                          
                          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                            <button 
                              className={`flex items-center justify-center p-2 rounded-md ${theme === 'light' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                              onClick={() => setTheme('light')}
                            >
                              <Sun className="w-4 h-4" />
                            </button>
                            <button 
                              className={`flex items-center justify-center p-2 rounded-md ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                              onClick={() => setTheme('dark')}
                            >
                              <Moon className="w-4 h-4" />
                            </button>
                            <button 
                              className={`flex items-center justify-center p-2 rounded-md ${theme === 'system' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                              onClick={() => setTheme('system')}
                            >
                              <Monitor className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Analytics Dashboard</p>
                              <p className="text-sm text-gray-500">Show analytics on dashboard home</p>
                            </div>
                          </div>
                          
                          <Switch checked={true} />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <CustomButton 
                          type="button" 
                          variant="primary"
                          size="md"
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
                          onClick={handleSavePreferences}
                        >
                          <Save className="h-4 w-4" />
                          Save Preferences
                        </CustomButton>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Control how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <BellRing className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive notification emails for important updates</p>
                            </div>
                          </div>
                          
                          <Switch 
                            checked={emailNotifications} 
                            onCheckedChange={setEmailNotifications} 
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <BellRing className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive browser notifications for important updates</p>
                            </div>
                          </div>
                          
                          <Switch 
                            checked={pushNotifications} 
                            onCheckedChange={setPushNotifications} 
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <CustomButton 
                          type="button" 
                          variant="primary"
                          size="md"
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
                          onClick={handleSavePreferences}
                        >
                          <Save className="h-4 w-4" />
                          Save Preferences
                        </CustomButton>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
