
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (googleScriptLoaded && window.google && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE") {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: async (response: any) => {
                        try {
                            await loginWithGoogle(response);
                            addToast("Google Login successful!", "success");
                            navigate('/dashboard');
                        } catch (error: any) {
                            addToast(error.message || "Google Login failed", "error");
                        }
                    }
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInDiv"),
                    { theme: "outline", size: "large", width: "100%" }
                );
            } catch (e) {
                console.error("Error initializing Google Sign-In", e);
            }
        }
    }, [googleScriptLoaded, loginWithGoogle, addToast, navigate]);

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
                <Link to="/" className="inline-flex items-center space-x-2">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white"><path d="M5.5 28V4H12.3L21.5 19.5V4H28V28H21.2L12 12.5V28H5.5Z" fill="currentColor"/></svg>
                    <div className="flex flex-col text-left"><span className="font-black text-xl tracking-tighter text-white">NextArc</span><span className="text-xs font-semibold tracking-[0.2em] text-gray-400 -mt-1">STUDIO</span></div>
                </Link>
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
                
                <div id="googleSignInDiv" className="flex justify-center min-h-[40px]">
                    {(!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") && (
                        <p className="text-xs text-red-400 text-center">
                            Google Sign-In requires a Client ID in constants.ts to work on your deployed domain.
                        </p>
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