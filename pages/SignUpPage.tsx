
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreators } from '../hooks/useCreators';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types';
import { cn } from '../lib/utils';
import { incrementCounter } from '../services/countersService';
import { GOOGLE_CLIENT_ID } from '../constants';

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

    useEffect(() => {
        if (googleScriptLoaded && window.google && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE") {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: async (response: any) => {
                        try {
                            await loginWithGoogle(response);
                            addToast("Google Sign-In successful!", "success");
                            navigate('/dashboard');
                        } catch (error: any) {
                            addToast(error.message || "Google Sign-In failed", "error");
                        }
                    }
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignUpDiv"),
                    { theme: "outline", size: "large", width: "100%", text: "signup_with" }
                );
            } catch (e) {
                console.error("Error initializing Google Sign-In", e);
            }
        }
    }, [googleScriptLoaded, loginWithGoogle, addToast, navigate]);

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
                 <Link to="/" className="inline-flex items-center space-x-2">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <path d="M5.5 28V4H12.3L21.5 19.5V4H28V28H21.2L12 12.5V28H5.5Z" fill="currentColor"/>
                    </svg>
                    <div className="flex flex-col text-left"><span className="font-black text-xl tracking-tighter text-white">NextArc</span><span className="text-xs font-semibold tracking-[0.2em] text-gray-400 -mt-1">STUDIO</span></div>
                </Link>
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
                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-neutral-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-neutral-900/50 px-2 text-neutral-400">Or continue with</span>
                  </div>
                </div>
                
                <div id="googleSignUpDiv" className="flex justify-center min-h-[40px]">
                    {(!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") && (
                        <p className="text-xs text-red-400 text-center">
                            Google Sign-In requires a Client ID in constants.ts to work on your deployed domain.
                        </p>
                    )}
                </div>

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