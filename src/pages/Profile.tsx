
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/CustomButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, User, Mail, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  specialty: string | null;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState('');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }
      
      setUserEmail(user.email);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setSpecialty(data.specialty || '');
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      
      if (!profile?.id) {
        throw new Error('No profile ID found');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          specialty: specialty
        })
        .eq('id', profile.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Refresh profile data
      fetchUserProfile();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdatePassword = async () => {
    // Reset error
    setPasswordError('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Update password through Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
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
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Manage your account and preferences
                </p>
              </div>
              
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsync-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading profile...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="col-span-1">
                    <Card>
                      <CardHeader className="text-center">
                        <Avatar className="h-24 w-24 mx-auto">
                          <AvatarImage src="" alt={`${firstName} ${lastName}`} />
                          <AvatarFallback className="text-2xl bg-medsync-100 text-medsync-700">
                            {firstName && lastName 
                              ? `${firstName.charAt(0)}${lastName.charAt(0)}`
                              : <User />
                            }
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle className="mt-4">{firstName} {lastName}</CardTitle>
                        <CardDescription>{specialty || 'Healthcare Provider'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center mt-2 text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{userEmail}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="personal">Personal Information</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="personal">
                        <Card>
                          <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                              Update your personal details
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input 
                                  id="firstName"
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input 
                                  id="lastName"
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="specialty">Specialty</Label>
                              <Input 
                                id="specialty"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="justify-end">
                            <CustomButton
                              variant="primary"
                              size="md"
                              onClick={handleUpdateProfile}
                              disabled={isSaving}
                              className="gap-2"
                            >
                              {isSaving ? (
                                <>Saving...</>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </CustomButton>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="password">
                        <Card>
                          <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                              Update your password
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input 
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input 
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                            </div>
                            
                            {passwordError && (
                              <div className="flex items-center text-red-500 text-sm mt-2">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {passwordError}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="justify-end">
                            <CustomButton
                              variant="primary"
                              size="md"
                              onClick={handleUpdatePassword}
                              disabled={isSaving || !newPassword || !confirmPassword}
                              className="gap-2"
                            >
                              {isSaving ? (
                                <>Updating...</>
                              ) : (
                                <>
                                  <Key className="h-4 w-4" />
                                  Update Password
                                </>
                              )}
                            </CustomButton>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
