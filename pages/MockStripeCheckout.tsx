
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Project, Offer } from '../types';
import { PLATFORM_FEE_PERCENTAGE } from '../constants';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Lock, CreditCard, Loader2, ShieldCheck } from 'lucide-react';

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
        // Simulate secure processing delay
        setTimeout(() => {
            const successUrl = `/success?project_id=${project.id}&offer_id=${offer.id}`;
            navigate(successUrl);
        }, 2000);
    };

    return (
        <div className="bg-[#F7F9FC] text-gray-800 min-h-screen py-12 px-4 flex items-center justify-center">
             <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                     <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                             <div className="bg-green-100 p-3 rounded-full">
                                <ShieldCheck className="h-8 w-8 text-green-600" />
                             </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
                        <p className="text-gray-500 text-sm mt-1">Powered by Stripe</p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="font-bold text-gray-900">{project.serviceType}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Project ID: {project.id.slice(-6)}</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between"><span>Service Fee</span> <span>${offer.amount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Platform Processing (8%)</span> <span>${platformFee.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200 mt-2"><span>Total Due</span> <span>${totalAmount.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Card Details</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <CreditCard className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input 
                                        className="bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent h-12 pl-10" 
                                        placeholder="0000 0000 0000 0000" 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <Input className="bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent h-12 text-center" placeholder="MM / YY" required />
                               </div>
                               <div>
                                   <Input className="bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent h-12 text-center" placeholder="CVC" required />
                               </div>
                            </div>
                         </div>
                         
                         <div className="mt-6">
                             <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg bg-[#FF4D00] hover:bg-[#FF4D00]/90" disabled={isProcessing}>
                                 {isProcessing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Payment...</> : <><Lock className="mr-2 h-4 w-4" /> Pay ${totalAmount.toFixed(2)}</>}
                             </Button>
                         </div>
                    </form>
                    
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-400 flex items-center justify-center">
                            <Lock className="h-3 w-3 mr-1" />
                            Encrypted & Secure connection
                        </p>
                        <Link to="/cancel" className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors">Cancel and return to dashboard</Link>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default MockStripeCheckout;