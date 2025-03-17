
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/CustomButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';

const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(passwordValidationRegex, { 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    }),
  confirmPassword: z.string().min(8, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });
  
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
  };
  
  const onSubmitLogin = async (values: LoginValues) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "You've successfully logged in!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        title: "Login Failed",
        description: error?.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmitRegister = async (values: RegisterValues) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user && !data.user.email_confirmed_at) {
        navigate('/verify-email');
        toast({
          title: "Verification Required",
          description: "Please check your email to confirm your account",
        });
      } else {
        navigate('/dashboard');
        toast({
          title: "Success",
          description: "You've successfully registered and logged in!",
        });
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration Failed",
        description: error?.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const LoginForm = () => (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
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
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <CustomButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </CustomButton>
      </form>
    </Form>
  );
  
  const RegisterForm = () => (
    <Form {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(onSubmitRegister)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={registerForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={registerForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={registerForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters and include an uppercase letter, 
                a lowercase letter, a number, and a special character.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={registerForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </FormControl>
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <CustomButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </CustomButton>
      </form>
    </Form>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-blue-100 dark:border-blue-900">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {isLogin ? 'Login to Your Account' : 'Create an Account'}
                </CardTitle>
                <CardDescription>
                  {isLogin ? 'Enter your credentials to access your account' : 'Fill out the form below to get started'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLogin ? <LoginForm /> : <RegisterForm />}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex items-center w-full">
                  <Separator className="flex-1" />
                  <span className="px-4 text-sm text-gray-500">OR</span>
                  <Separator className="flex-1" />
                </div>
                
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
