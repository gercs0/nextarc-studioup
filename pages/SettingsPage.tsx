import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const SettingsPage: React.FC = () => {
    const { currentUser, toggle2FA } = useAuth();
    const { addToast } = useToast();
    const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser?.twoFactorEnabled || false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handle2FAToggle = async () => {
        setIsUpdating(true);
        const newState = !is2FAEnabled;
        await toggle2FA(newState);
        setIs2FAEnabled(newState);
        addToast(`Two-Factor Authentication ${newState ? 'Enabled' : 'Disabled'}.`, 'success');
        if (newState) {
            // In a real app, this would trigger a QR code setup flow.
            alert("2FA Enabled! In a real application, you would now scan a QR code.");
        }
        setIsUpdating(false);
    };
    
    if (!currentUser) {
        return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Please Log In</h3>
                <p className="mt-2 text-gray-400">You must be logged in to access your settings.</p>
                <Button asChild className="mt-6">
                    <Link to="/login">Log In or Sign Up</Link>
                </Button>
            </div>
        );
    }


    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-white">Account Settings</h1>
                <p className="mt-2 text-lg text-gray-400">Manage your account preferences and security.</p>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg divide-y divide-neutral-800">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white flex items-center"><User className="mr-3 h-5 w-5" /> Account Information</h2>
                    <div className="mt-4 space-y-2 text-sm">
                        <p><strong>Name:</strong> {currentUser.name}</p>
                        <p><strong>Email:</strong> {currentUser.email}</p>
                        <p><strong>Role:</strong> <span className="capitalize">{currentUser.role}</span></p>
                    </div>
                </div>
                 <div className="p-6">
                    <h2 className="text-lg font-semibold text-white flex items-center"><Lock className="mr-3 h-5 w-5" /> Change Password</h2>
                    <p className="text-sm text-gray-400 mt-2">For security reasons, this feature would typically involve an email confirmation flow. This is a placeholder for the MVP.</p>
                    <Button variant="secondary" className="mt-4" disabled>Request Password Change</Button>
                </div>
                 <div className="p-6">
                    <h2 className="text-lg font-semibold text-white flex items-center"><ShieldCheck className="mr-3 h-5 w-5" /> Two-Factor Authentication (2FA)</h2>
                    <p className="text-sm text-gray-400 mt-2">Add an extra layer of security to your account. When enabled, you'll be asked for a code from your authenticator app when you sign in.</p>
                    <div className="mt-4 flex items-center space-x-4">
                        <button
                            type="button"
                            className={cn(
                                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:ring-offset-2 focus:ring-offset-neutral-900',
                                is2FAEnabled ? 'bg-[#FF4D00]' : 'bg-neutral-700',
                                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            )}
                            role="switch"
                            aria-checked={is2FAEnabled}
                            onClick={handle2FAToggle}
                            disabled={isUpdating}
                        >
                            <span className="sr-only">Use setting</span>
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                    is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                                )}
                            />
                        </button>
                        <span className={cn('font-semibold', is2FAEnabled ? 'text-green-400' : 'text-gray-400')}>
                            {is2FAEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;