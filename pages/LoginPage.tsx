
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
import { UserRole } from '../types';
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
    const [adminPassword, setAdminPassword] = useState('');
    const [adminError, setAdminError] = useState('');
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    // Check if the provided ID looks like a valid Google OAuth Client ID
    const hasValidGoogleClientId = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.length > 0 && GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');
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
            // Script is usually loaded via index.html, but check periodically
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
            await loginWithGoogle(response);
            addToast("Google Login successful!", "success");
            navigate('/dashboard');
        } catch (error: any) {
            addToast(error.message || "Google Login failed", "error");
        }
    }, [loginWithGoogle, addToast, navigate]);

    useEffect(() => {
        if (googleScriptLoaded && window.google && hasValidGoogleClientId && googleButtonRef.current) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback
                });
                // Fixed error: width cannot be "100%", it must be pixel value string or left default
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { theme: "outline", size: "large" } 
                );
            } catch (e) {
                console.error("Error initializing Google Sign-In", e);
            }
        }
    }, [googleScriptLoaded, hasValidGoogleClientId, handleGoogleCallback]);

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password, data.role);
            addToast("Login successful!", "success");
            navigate('/dashboard');
        } catch (error: any) {
            addToast(error.message || "Failed to log in", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDemoGoogleLogin = async () => {
        try {
             // Create a fake credential that mimics the Google JWT structure
             const fakePayload = {
                 email: "demo_athlete@gmail.com",
                 name: "Demo Athlete",
                 picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
                 sub: "1029384756"
             };
             // Base64 encode the payload for the JWT middle part
             const encodedPayload = btoa(JSON.stringify(fakePayload));
             const fakeCredential = `header.${encodedPayload}.signature`;

             await loginWithGoogle({ credential: fakeCredential });
             addToast("Demo Google Login successful!", "success");
             navigate('/dashboard');
        } catch (error: any) {
            addToast("Demo login failed", "error");
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === 'Gercso123@#') {
            localStorage.setItem('isAdminAuthenticated', 'true');
            addToast('Admin login successful!', 'success');
            navigate('/admin');
        } else {
            setAdminError('Incorrect password. Access denied.');
            setAdminPassword('');
        }
    };

    if (isAdminLogin) {
        return (
             <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="w-full max-w-md">
                    <form onSubmit={handleAdminSubmit} className="bg-neutral-900/50 border border-neutral-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
                        <div className="text-center mb-6">
                            <KeyRound className="mx-auto h-12 w-12 text-[#FF4D00]"/>
                            <h1 className="text-2xl font-bold text-white mt-4">Admin Access Required</h1>
                            <p className="text-gray-400 mt-2">Please enter the password to continue.</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-bold mb-2 sr-only" htmlFor="password">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••••••"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        {adminError && <p className="text-red-500 text-xs italic mb-4 text-center">{adminError}</p>}
                        <div className="flex items-center justify-center">
                            <Button type="submit" className="w-full">
                                Authenticate
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="flex justify-center">
                    <Logo to="/" />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter text-white mt-6">Welcome Back</h1>
                <p className="text-gray-400">Log in to manage your projects.</p>
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
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </Button>
                </form>
                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-neutral-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-neutral-900 px-2 text-neutral-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="flex justify-center min-h-[40px]">
                    {hasValidGoogleClientId ? (
                        <div ref={googleButtonRef} className="w-full flex justify-center"></div>
                    ) : (
                        <button 
                            onClick={handleDemoGoogleLogin}
                            className="flex items-center justify-center w-full bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            Sign in with Google (Demo)
                        </button>
                    )}
                </div>

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
