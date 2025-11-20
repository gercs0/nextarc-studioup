
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreators } from '../hooks/useCreators';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { incrementCounter } from '../services/countersService';
import { GOOGLE_CLIENT_ID } from '../constants';
import { Logo } from '../components/ui/Logo';

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['athlete', 'creator'], { required_error: "You must select a role" }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const { signup, loginWithGoogle } = useAuth();
    const { addCreator } = useCreators();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema)
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
            await loginWithGoogle(response);
            addToast("Google Sign-In successful!", "success");
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Google Sign-Up Error:", error);
            addToast(error.message || "Google Sign-In failed", "error");
        }
    }, [loginWithGoogle, addToast, navigate]);

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
                    { theme: "outline", size: "large", text: "signup_with", width: "300" }
                );
            } catch (e) {
                console.error("Error initializing Google Sign-In", e);
            }
        }
    }, [googleScriptLoaded, handleGoogleCallback]);

    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        setIsLoading(true);
        try {
            const newUser = await signup(data.name, data.email, data.role, data.password);
            
            if (newUser.role === 'creator') {
                addCreator(newUser);
            }

            await incrementCounter(data.role === 'athlete' ? 'athletes' : 'followers'); 
            addToast("Account created successfully!", "success");
            navigate('/dashboard');
        } catch (error: any) {
            addToast(error.message || "Failed to sign up", "error");
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
                <h1 className="text-3xl font-bold tracking-tighter text-white mt-6">Create Your Account</h1>
                <p className="text-gray-400">Join the premier marketplace for athletes and creators.</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <Input {...register("name")} placeholder="Your Name" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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

                    {selectedRole === 'creator' && (
                        <div className="text-xs text-center text-yellow-300 bg-yellow-900/50 p-3 rounded-md">
                            Creator accounts require manual verification before you can make offers on projects.
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                {GOOGLE_CLIENT_ID && (
                    <>
                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-neutral-700" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="bg-neutral-900/50 px-2 text-neutral-400">Or continue with</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center min-h-[40px]">
                            <div ref={googleButtonRef} className="flex justify-center"></div>
                        </div>
                    </>
                )}

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-[#FF4D00] hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;