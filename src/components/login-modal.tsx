'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Facebook, Linkedin, Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { signInSchema, signUpSchema } from '@/lib/schemas/auth';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

// Helper components for Font Awesome icons
const Icon = ({ faClass }: { faClass: string }) => {
  return <i className={faClass}></i>;
};

function SignInForm({ onClose }: { onClose?: () => void }) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      form.setValue('email', savedEmail);
      form.setValue('password', savedPassword);
      setRememberMe(true);
    }
  }, [form]);

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setLoading(true);
    setError('');
    
    try {
      await signIn(data.email, data.password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
        localStorage.setItem('rememberedPassword', data.password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      onClose?.(); // Close the modal on successful login
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide specific error messages based on Firebase error codes
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter your email address" 
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                <Link
                  href="#"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    {...field} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <label
            htmlFor="remember-me"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            Remember my password
          </label>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}

function SignUpForm({ onClose }: { onClose?: () => void }) {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
  });

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    setLoading(true);
    setError('');
    
    try {
      await signUp(data.email, data.password, {
        name: data.email.split('@')[0],
        role: data.role
      });
      onClose?.(); // Close the modal on successful signup
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter your email address" 
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    {...field} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    {...field} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-700">I am a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="rto">RTO (Registered Training Organisation)</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function LoginModal({ onClose }: { onClose?: () => void }) {
  return (
    <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-0 bg-white">
      <CardHeader className="text-center space-y-3 pb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600">
          Access your account or create a new one to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="sign-in" className="h-9 rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up" className="h-9 rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="space-y-5 mt-6">
            <SignInForm onClose={onClose} />
          </TabsContent>
          <TabsContent value="sign-up" className="space-y-5 mt-6">
            <SignUpForm onClose={onClose} />
          </TabsContent>
        </Tabs>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-500 font-medium">
              OR CONTINUE WITH
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Icon faClass="fab fa-google text-red-500" />
          </Button>
          <Button 
            variant="outline" 
            className="h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
          </Button>
          <Button 
            variant="outline" 
            className="h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}