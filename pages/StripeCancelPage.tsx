
import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const StripeCancelPage: React.FC = () => {
    return (
        <div className="text-center py-20">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Payment Canceled</h1>
            <p className="mt-6 text-base leading-7 text-gray-300">Your payment process was canceled. You have not been charged.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild>
                    <Link to="/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
};

export default StripeCancelPage;
