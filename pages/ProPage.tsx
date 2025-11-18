
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreators } from '../hooks/useCreators';
import { useToast } from '../hooks/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Check, Crown, User, Zap } from 'lucide-react';

const ProPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { getCreatorById, upgradeToPro } = useCreators();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const creator = currentUser ? getCreatorById(currentUser.id) : null;

    const handleUpgrade = () => {
        if (!currentUser) return;
        // In a real app, this would redirect to a Stripe checkout page for the subscription.
        // For this MVP, we just update the state.
        upgradeToPro(currentUser.id);
        addToast("Congratulations! You are now a NextArc Pro!", "success");
        navigate(`/creator/${currentUser.id}`);
    };
    
    if (!currentUser || currentUser.role !== 'creator') {
        return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Exclusive for Creators</h3>
                <p className="mt-2 text-gray-400">The Pro subscription is designed to help creators grow their business.</p>
                <Button asChild className="mt-6">
                    <Link to="/signup">Join as a Creator</Link>
                </Button>
            </div>
        );
    }
    
    const proFeatures = [
        { name: "Pro Badge", description: "Stand out with a Pro badge on your profile and offers.", icon: Crown },
        { name: "Priority Placement", description: "Appear higher in search results for athletes.", icon: Zap },
        { name: "Reduced Platform Fees", description: "Enjoy a lower platform fee on all completed projects (coming soon).", icon: Check },
        { name: "Advanced Analytics", description: "Get insights into your earnings and performance (coming soon).", icon: Check },
    ];


    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
                 <Crown className="mx-auto h-12 w-12 text-yellow-400" />
                <h1 className="text-4xl font-black tracking-tighter text-white mt-4">Go NextArc Pro</h1>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">Unlock exclusive features to win more projects and grow your freelance business.</p>
            </div>

            <div className="bg-neutral-900/50 border border-yellow-400/30 rounded-lg p-8">
                {creator?.isPro ? (
                    <div className="text-center">
                        <Check className="mx-auto h-12 w-12 text-green-400" />
                        <h2 className="text-2xl font-bold text-white mt-4">You are already a Pro!</h2>
                        <p className="text-gray-300 mt-2">Thank you for being a valued member of our Pro community.</p>
                        <Button asChild variant="outline" className="mt-6">
                            <Link to={`/creator/${currentUser.id}`}>View My Profile</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            {proFeatures.map(feature => (
                                <div key={feature.name} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <feature.icon className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-md font-semibold text-white">{feature.name}</h3>
                                        <p className="text-sm text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-neutral-800 text-center">
                            <p className="text-4xl font-bold text-white">$19<span className="text-lg font-normal text-gray-400">/month</span></p>
                            <p className="text-sm text-gray-500 mt-1">Billed monthly. Cancel anytime.</p>
                            <Button size="lg" className="mt-6 w-full md:w-auto" onClick={handleUpgrade}>
                                Upgrade to Pro
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProPage;
