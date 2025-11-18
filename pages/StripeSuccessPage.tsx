
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useNotifications } from '../hooks/useNotifications';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const StripeSuccessPage: React.FC = () => {
    const location = useLocation();
    const { acceptOffer, getProjectById } = useProjects();
    const { addNotification } = useNotifications();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const projectId = params.get('project_id');
        const offerId = params.get('offer_id');

        if (projectId && offerId && !processed) {
            acceptOffer(projectId, offerId);
            setProcessed(true);

            const project = getProjectById(projectId);
            const offer = project?.offers.find(o => o.id === offerId);

            if (project && offer) {
                addNotification(
                    offer.creatorId,
                    `${project.athleteName} has accepted your offer for "${project.serviceType}"!`,
                    '/dashboard'
                );
            }
        }
    }, [location, acceptOffer, processed, getProjectById, addNotification]);

    return (
        <div className="text-center py-20 bg-[#050810] text-gray-200 min-h-screen flex flex-col justify-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Payment Successful!</h1>
            <p className="mt-6 text-base leading-7 text-gray-300">Your project is now in progress. The creator has been notified.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild>
                    <Link to="/dashboard">Go to My Dashboard</Link>
                </Button>
                <Button asChild variant="ghost">
                    <Link to="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    );
};

export default StripeSuccessPage;
