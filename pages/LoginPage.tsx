

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { KeyRound } from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '../constants';
import { Logo } from '../components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(['athlete', 'creator'], { required_error: "You must select a role" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

declare global {
    interface Window {
        google: any;
    }
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle } = useAuth();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const isAdminLogin = new URLSearchParams(location.search).get('admin') === 'true';

    const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const selectedRole = watch('role');

    useEffect(() => {
        const loadGoogleScript = () => {
            if (window.google) {
                setGoogleScriptLoaded(true);
                return;
            }
            const interval = setInterval(() => {
                if (window.google) {
                    setGoogleScriptLoaded(true);
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        };
        loadGoogleScript();
    }, []);

    const handleGoogleCallback = useCallback(async (response: any) => {
        try {
            const user = await loginWithGoogle(response);
            addToast("Google Login successful!", "success");
            
            if (isAdminLogin) {
                if (user.isAdmin) {
                    navigate('/admin');
                } else {
                    addToast("Access Denied: You do not have admin privileges.", "error");
                    navigate('/dashboard');
                }
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error("Google Login Error:", error);
            addToast(error.message || "Google Login failed", "error");
        }
    }, [loginWithGoogle, addToast, navigate, isAdminLogin]);

    useEffect(() => {
        // Only attempt to render the button if we have a potentially valid Client ID
        if (googleScriptLoaded && window.google && googleButtonRef.current && GOOGLE_CLIENT_ID) {
            try {
                // Clear any existing button to prevent duplicates
                googleButtonRef.current.innerHTML = '';

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                    auto_select: false
                });
                
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { theme: "outline", size: "large", width: "300" } 
                );
            } catch (e) {
                console.error("Error initializing Google Sign-In", e);
            }
        }
    }, [googleScriptLoaded, handleGoogleCallback]);

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setIsLoading(true);
        try {
            const user = await login(data.email, data.password, data.role);
            addToast("Login successful!", "success");

            if (isAdminLogin) {
                if (user.isAdmin) {
                    navigate('/admin');
                } else {
                    addToast("Access Denied: You do not have admin privileges.", "error");
                    navigate('/dashboard');
                }
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            addToast(error.message || "Failed to log in", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="flex justify-center">
                    <Logo to="/" />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter text-white mt-6">
                    {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
                </h1>
                <p className="text-gray-400">
                    {isAdminLogin ? 'Secure access for administrators.' : 'Log in to manage your projects.'}
                </p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium mb-2">I am an...</label>
                         <div className="grid grid-cols-2 gap-2">
                            <label className={cn("flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors", selectedRole === 'athlete' ? 'bg-[#FF4D00] border-[#FF4D00] text-white' : 'border-neutral-700 hover:bg-neutral-800')}>
                                <input type="radio" {...register("role")} value="athlete" className="sr-only"/>
                                Athlete
                            </label>
                             <label className={cn("flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors", selectedRole === 'creator' ? 'bg-[#FF4D00] border-[#FF4D00] text-white' : 'border-neutral-700 hover:bg-neutral-800')}>
                                <input type="radio" {...register("role")} value="creator" className="sr-only"/>
                                Creator
                            </label>
                         </div>
                         {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input {...register("email")} type="email" placeholder="you@example.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input {...register("password")} type="password" placeholder="••••••••" />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Logging In...' : (isAdminLogin ? 'Access Admin Panel' : 'Log In')}
                    </Button>
                </form>
                
                {GOOGLE_CLIENT_ID && (
                    <>
                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-neutral-700" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="bg-neutral-900 px-2 text-neutral-400">Or continue with</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center min-h-[40px]">
                            <div ref={googleButtonRef} className="flex justify-center"></div>
                        </div>
                    </>
                )}

                <p className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-[#FF4D00] hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;