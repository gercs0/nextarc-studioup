
import React, { useState } from 'react';
import { Project, Offer } from '../types';
import { Button } from './ui/Button';
import { PLATFORM_FEE_PERCENTAGE } from '../constants';
import { Loader2 } from 'lucide-react';

interface CheckoutModalProps {
    project: Project;
    offer: Offer;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ project, offer, onClose, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const platformFee = offer.amount * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = offer.amount + platformFee;

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            onSuccess();
            setIsProcessing(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-neutral-900 rounded-lg shadow-xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-1 text-white">Confirm Payment</h2>
                <p className="text-gray-400 mb-6">For project: "{project.serviceType}"</p>
                
                <div className="space-y-2 text-gray-300 border-y border-neutral-700 py-4 my-4">
                    <div className="flex justify-between"><span>Creator's Offer</span> <span>${offer.amount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Platform Fee (8%)</span> <span>${platformFee.toFixed(2)}</span></div>
                    <div className="flex justify-between text-white font-bold text-lg border-t border-neutral-700 pt-2 mt-2"><span>Total</span> <span>${totalAmount.toFixed(2)}</span></div>
                </div>

                <p className="text-xs text-gray-500 text-center mb-6">This is a simulated transaction for this MVP. No real payment will be processed.</p>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button type="button" onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay $${totalAmount.toFixed(2)}`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
