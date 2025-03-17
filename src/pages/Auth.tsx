
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/CustomButton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Initialize forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    },
    mode: 'onChange'
  });

  // Password strength indicators
  const passwordValue = signupForm.watch('password') || '';
  const passwordStrength = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  };

  // Handle login
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "You are now logged in"
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created",
        description: "Please check your email to verify your account"
      });

      // Automatically log them in
      await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      navigate('/verify-email');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="relative h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-semibold">M</span>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full border-2 border-blue-500 animate-pulse-subtle"></div>
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-neutral-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Welcome to MedSync
        </h2>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <div className="bg-white dark:bg-neutral-800 px-6 py-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            autoComplete="email"
                            className="border-gray-300 dark:border-gray-600"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Password" 
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className="border-gray-300 dark:border-gray-600 pr-10"
                              {...field} 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              onClick={toggleShowPassword}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <CustomButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </CustomButton>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          <TabsContent value="signup">
            <div className="bg-white dark:bg-neutral-800 px-6 py-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={signupForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="First Name" 
                              autoComplete="given-name"
                              className="border-gray-300 dark:border-gray-600"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Last Name" 
                              autoComplete="family-name"
                              className="border-gray-300 dark:border-gray-600"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            autoComplete="email"
                            className="border-gray-300 dark:border-gray-600"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Password" 
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="border-gray-300 dark:border-gray-600 pr-10"
                              {...field} 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              onClick={toggleShowPassword}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Password strength indicators */}
                  <div className="space-y-2 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/30">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password must have:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        {passwordStrength.length ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={`text-xs ${passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.uppercase ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={`text-xs ${passwordStrength.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          1 uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.lowercase ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={`text-xs ${passwordStrength.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          1 lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.number ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={`text-xs ${passwordStrength.number ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          1 number
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 sm:col-span-2">
                        {passwordStrength.special ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={`text-xs ${passwordStrength.special ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          1 special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <CustomButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </CustomButton>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
