
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project, Offer } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface MakeOfferModalProps {
    project: Project;
    onClose: () => void;
    onSubmit: (offer: Omit<Offer, 'id' | 'timestamp' | 'messages'>) => void;
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ project, onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const { addToast } = useToast();
    const { currentUser } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || currentUser.role !== 'creator' || !currentUser.verified) {
            addToast('You must be a verified creator to make an offer.', 'error');
            return;
        }

        onSubmit({
            creatorId: currentUser.id,
            creatorName: currentUser.name,
            amount: parseFloat(amount),
            message,
        });
    };

    if (!currentUser) {
        return (
             <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
                <div className="bg-neutral-900 rounded-lg shadow-xl p-8 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4 text-white">Please Log In</h2>
                    <p className="text-gray-400 mb-6">You need to be logged in as a creator to make an offer.</p>
                    <div className="flex justify-center gap-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button asChild>
                            <Link to="/login">Log In</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (currentUser.role === 'creator' && !currentUser.verified) {
        return (
             <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
                <div className="bg-neutral-900 rounded-lg shadow-xl p-8 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4 text-white">Account Pending Verification</h2>
                    <p className="text-gray-400 mb-6">Your creator account is under review. Once verified, you will be able to make offers on projects.</p>
                     <Button type="button" variant="outline" onClick={onClose}>Got It</Button>
                </div>
            </div>
        )
    }

    if (currentUser.role !== 'creator') {
        return (
             <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
                <div className="bg-neutral-900 rounded-lg shadow-xl p-8 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4 text-white">Athletes Cannot Make Offers</h2>
                    <p className="text-gray-400 mb-6">Your account is registered as an athlete. Only creators can make offers on projects.</p>
                     <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-neutral-900 rounded-lg shadow-xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-1 text-white">Make an Offer</h2>
                <p className="text-gray-400 mb-6">For "{project.serviceType}"</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Your Offer Amount ($)</label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g., 500" />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Your Pitch</label>
                        <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} placeholder="Briefly explain why you're a great fit for this project." />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Submit Offer</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MakeOfferModal;
