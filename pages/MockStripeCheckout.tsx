
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Project, Offer } from '../types';
import { PLATFORM_FEE_PERCENTAGE } from '../constants';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Lock, CreditCard, Loader2 } from 'lucide-react';

const MockStripeCheckout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getProjectById } = useProjects();

    const [project, setProject] = useState<Project | null>(null);
    const [offer, setOffer] = useState<Offer | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const projectId = params.get('project_id');
        const offerId = params.get('offer_id');

        if (projectId && offerId) {
            const foundProject = getProjectById(projectId);
            if (foundProject) {
                setProject(foundProject);
                const foundOffer = foundProject.offers.find(o => o.id === offerId);
                if (foundOffer) {
                    setOffer(foundOffer);
                } else {
                    navigate('/cancel'); // Offer not found
                }
            } else {
                navigate('/cancel'); // Project not found
            }
        } else {
            navigate('/cancel'); // Invalid params
        }
    }, [location.search, getProjectById, navigate]);

    if (!project || !offer) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md mx-auto">
                    <Skeleton className="h-24 w-full mb-4" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }
    
    const platformFee = offer.amount * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = offer.amount + platformFee;
    
    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const successUrl = `/success?project_id=${project.id}&offer_id=${offer.id}`;
            navigate(successUrl);
        }, 2000);
    };

    return (
        <div className="bg-gray-100 text-gray-800 min-h-screen py-12 px-4">
             <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                     <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">NextArc Studio Checkout</h1>
                        <p className="text-gray-500">Secure payment powered by simulation</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                        <h2 className="font-semibold text-lg">{project.serviceType}</h2>
                        <p className="text-sm text-gray-600">For: {project.athleteName}</p>
                        <div className="mt-4 border-t border-gray-200 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Creator's Offer</span> <span>${offer.amount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Platform Fee (8%)</span> <span>${platformFee.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-base mt-2"><span>Total</span> <span>${totalAmount.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Card information</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <CreditCard className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input className="bg-white text-gray-900 placeholder:text-gray-500 border-gray-300 focus:ring-[#FF4D00] focus:border-[#FF4D00]" placeholder="4242 4242 4242 4242" style={{paddingLeft: '2.5rem'}} />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                               <Input className="bg-white text-gray-900 placeholder:text-gray-500 border-gray-300 focus:ring-[#FF4D00] focus:border-[#FF4D00]" placeholder="MM / YY" />
                               <Input className="bg-white text-gray-900 placeholder:text-gray-500 border-gray-300 focus:ring-[#FF4D00] focus:border-[#FF4D00]" placeholder="CVC" />
                            </div>
                         </div>
                         <Button type="submit" className="w-full mt-6" size="lg" disabled={isProcessing}>
                             {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><Lock className="mr-2 h-4 w-4" /> Pay ${totalAmount.toFixed(2)}</>}
                         </Button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <Link to="/cancel" className="text-sm text-gray-500 hover:text-gray-700">Cancel payment</Link>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default MockStripeCheckout;
