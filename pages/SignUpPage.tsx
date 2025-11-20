
import React, { useState } from 'react';
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

    const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema)
    });
    
    const selectedRole = watch('role');

    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        setIsLoading(true);
        try {
            const newUser = await signup(data.name, data.email, data.role, data.password);
            
            if (newUser.role === 'creator') {
                addCreator(newUser);
            }

            await incrementCounter(data.role === 'athlete' ? 'athletes' : 'followers'); // Use followers for creators
            addToast("Account created successfully!", "success");
            navigate('/dashboard');
        } catch (error: any) {
            addToast(error.message || "Failed to sign up", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            // Note: This simulated Google login does not create a new profile.
            await loginWithGoogle();
            addToast("Login successful!", "success");
            navigate('/dashboard');
        } catch (error: any)
 {
            addToast(error.message || "Failed to sign in with Google", "error");
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
                            Creator accounts require manual verification before you can make offers on projects. This may take 24-48 hours.
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
                <div>
                     <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                        <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.5 58.7L358.4 144.1C322.7 112.5 288.5 96 248 96c-88.8 0-160.1 71.1-160.1 160s71.3 160 160.1 160c97.5 0 140.1-83.9 143.8-124.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                        Sign up with Google
                    </Button>
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
