
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useCreators } from '../hooks/useCreators';
import { Button } from '../components/ui/Button';
import { Project, Offer, ProjectStatus, Message } from '../types';
import { incrementCounter } from '../services/countersService';
import { useToast } from '../hooks/useToast';
import Rating from '../components/ui/Rating';
import { Check, Clock, Inbox, User, DollarSign, Briefcase, TrendingUp, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProjectWorkspace from '../components/ProjectWorkspace';
import { Textarea } from '../components/ui/Textarea';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { redirectToCheckout } from '../services/stripeService';
import { useNotifications } from '../hooks/useNotifications';

const RatingModal: React.FC<{ project: Project; offer: Offer; onClose: () => void; onSubmit: (rating: number, comment: string) => void; }> = ({ project, offer, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { getCreatorById } = useCreators();
    const creator = getCreatorById(offer.creatorId);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-neutral-900 rounded-lg shadow-xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-1 text-white">Rate Your Experience</h2>
                <p className="text-gray-400 mb-2">Project: "{project.serviceType}"</p>
                <p className="text-gray-400 mb-6">Creator: {creator?.username}</p>
                <div className="flex justify-center my-4">
                    <Rating value={rating} onChange={setRating} size={40} />
                </div>
                <div className="my-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">Leave a review</label>
                    <Textarea 
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={`How was your experience with ${creator?.username}?`}
                        rows={3}
                    />
                </div>
                <p className="text-sm text-center text-gray-500 mb-6">Your rating and review will be publicly visible.</p>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={() => onSubmit(rating, comment)} disabled={rating === 0 || !comment.trim()}>Submit Review</Button>
                </div>
            </div>
        </div>
    );
};

const OfferConversation: React.FC<{project: Project, offer: Offer}> = ({ project, offer }) => {
    const { currentUser } = useAuth();
    const { addMessageToOffer } = useProjects();
    const { addNotification } = useNotifications();
    const [message, setMessage] = useState('');

    if (!currentUser) return null;

    const handleSendMessage = () => {
        if (!message.trim()) return;

        addMessageToOffer(project.id, offer.id, {
            userId: currentUser.id,
            userName: currentUser.name,
            text: message,
        });

        const recipientId = currentUser.role === 'athlete' ? offer.creatorId : project.ownerId;
        addNotification(recipientId, `New message from ${currentUser.name} regarding your offer on "${project.serviceType}"`, '/dashboard');
        
        setMessage('');
    };

    return (
        <div className="mt-4 pt-4 border-t border-neutral-700/50">
             <h4 className="font-semibold text-sm text-gray-300 mb-2">Conversation</h4>
             <div className="space-y-2 mb-2 max-h-48 overflow-y-auto pr-2">
                {offer.messages.map(msg => (
                    <div key={msg.id} className={`text-xs ${msg.userId === currentUser.id ? 'text-right' : 'text-left'}`}>
                        <span className="font-bold">{msg.userName === currentUser.name ? 'You' : msg.userName}: </span>
                        <span>{msg.text}</span>
                    </div>
                ))}
                 {offer.messages.length === 0 && <p className="text-xs text-gray-500 italic">No messages yet.</p>}
            </div>
            <div className="flex gap-2">
                <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask a question..." className="h-9"/>
                <Button onClick={handleSendMessage} size="sm"><Send size={14} /></Button>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { projects, updateProjectStatus } = useProjects();
    const { addRating, getCreatorById } = useCreators();
    const { addToast } = useToast();
    const { addNotification } = useNotifications();
    const [ratingProject, setRatingProject] = useState<Project | null>(null);
    const [ratedProjects, setRatedProjects] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<ProjectStatus>('in-progress');


    useEffect(() => {
        const storedRatings = JSON.parse(localStorage.getItem('ratedProjects') || '{}');
        setRatedProjects(storedRatings);
    }, []);

    const myProjects = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'athlete') {
            return projects.filter(p => p.ownerId === currentUser.id);
        }
        if (currentUser.role === 'creator') {
            return projects.filter(p => {
                const hasMyOffer = p.offers.some(o => o.creatorId === currentUser.id);
                if (p.status === 'open' && hasMyOffer) return true;
                const isMyOfferAccepted = p.acceptedOfferId && p.offers.some(o => o.id === p.acceptedOfferId && o.creatorId === currentUser.id);
                if (isMyOfferAccepted) return true;
                return false;
            });
        }
        return [];
    }, [projects, currentUser]);

     const filteredProjects = useMemo(() => {
        return myProjects.filter(p => p.status === activeTab);
    }, [myProjects, activeTab]);

    const stats = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'athlete') {
            const completed = myProjects.filter(p => p.status === 'completed');
            const totalSpent = completed.reduce((acc, p) => {
                const offer = p.offers.find(o => o.id === p.acceptedOfferId);
                return acc + (offer?.amount || 0);
            }, 0);
            return [
                { label: 'In Progress', value: myProjects.filter(p => p.status === 'in-progress').length, icon: Briefcase },
                { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: DollarSign },
                { label: 'Projects Completed', value: completed.length, icon: Check },
            ];
        }
        if (currentUser.role === 'creator') {
            const completed = myProjects.filter(p => p.status === 'completed');
            const totalEarned = completed.reduce((acc, p) => {
                 const offer = p.offers.find(o => o.id === p.acceptedOfferId);
                return acc + (offer?.amount || 0);
            }, 0);
            return [
                { label: 'Active Projects', value: myProjects.filter(p => p.status === 'in-progress').length, icon: Briefcase },
                { label: 'Total Earned', value: `$${totalEarned.toLocaleString()}`, icon: TrendingUp },
                { label: 'Offers Sent', value: projects.filter(p => p.offers.some(o => o.creatorId === currentUser.id)).length, icon: Send },
            ];
        }
        return [];
    }, [currentUser, myProjects, projects]);

    
    const handleAcceptOfferClick = (project: Project, offer: Offer) => {
        redirectToCheckout(project, offer);
    };
    
    const handleMarkComplete = async (project: Project) => {
        const allDeliverablesApproved = (project.deliverables || []).length > 0 && project.deliverables.every(d => d.status === 'approved');
        const allMilestonesReleased = (project.milestones || []).length === 0 || project.milestones.every(m => m.status === 'released');

        if (!allDeliverablesApproved) {
            addToast('All deliverables must be approved before completing the project.', 'warning');
            return;
        }
        if (!allMilestonesReleased) {
            addToast('All milestones must be released before completing the project.', 'warning');
            return;
        }

        updateProjectStatus(project.id, 'completed');
        const acceptedOffer = project.offers.find(o => o.id === project.acceptedOfferId);
        if (acceptedOffer) {
            addNotification(
                acceptedOffer.creatorId,
                `Your work for "${project.serviceType}" has been approved! Payment released.`,
                '/dashboard'
            );
        }
        await incrementCounter('completed');
        addToast('Project marked as complete!', 'success');
    };

    const handleRatingSubmit = (rating: number, comment: string) => {
        if (ratingProject && currentUser) {
            const offer = ratingProject.offers.find(o => o.id === ratingProject.acceptedOfferId);
            if(offer) {
                addRating(offer.creatorId, {
                    projectId: ratingProject.id,
                    projectName: ratingProject.serviceType,
                    athleteId: currentUser.id,
                    athleteName: currentUser.name,
                    rating,
                    comment
                });
                const newRatedProjects = { ...ratedProjects, [ratingProject.id]: true };
                setRatedProjects(newRatedProjects);
                localStorage.setItem('ratedProjects', JSON.stringify(newRatedProjects));
                addToast('Thank you for your feedback!', 'success');
            }
        }
        setRatingProject(null);
    };
    
    const getStatusBadge = (status: ProjectStatus) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center';
        switch(status) {
            case 'open':
                return <span className={`${baseClasses} bg-blue-900 text-blue-300`}><Clock className="w-3 h-3 mr-1.5" />Open</span>;
            case 'in-progress':
                return <span className={`${baseClasses} bg-yellow-900 text-yellow-300`}><Clock className="w-3 h-3 mr-1.5" />In Progress</span>;
            case 'completed':
                return <span className={`${baseClasses} bg-green-900 text-green-300`}><Check className="w-3 h-3 mr-1.5" />Completed</span>;
             case 'disputed':
                return <span className={`${baseClasses} bg-red-900 text-red-300`}><Check className="w-3 h-3 mr-1.5" />Disputed</span>;
        }
    };

    const acceptedOfferForRating = ratingProject ? ratingProject.offers.find(o => o.id === ratingProject.acceptedOfferId) : null;

    if (!currentUser) {
        return (
            <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                <User className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-xl font-semibold text-white">Please Log In to View Your Dashboard</h3>
                <p className="mt-2 text-gray-400">Manage your content commissions and collaborations.</p>
                <Button asChild className="mt-6">
                    <Link to="/login">Log In or Sign Up</Link>
                </Button>
            </div>
        );
    }
    
    const tabs: { id: ProjectStatus, label: string }[] = [
        { id: 'in-progress', label: 'In Progress' },
        { id: 'open', label: 'Open' },
        { id: 'completed', label: 'Completed' },
        { id: 'disputed', label: 'Disputed' },
    ];


    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-white">My Dashboard</h1>
                <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-400">Manage your projects, review offers, and track progress.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 flex items-center">
                        <stat.icon className="h-8 w-8 text-[#FF4D00]" />
                        <div className="ml-4">
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-8 border-b border-neutral-800">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                                activeTab === tab.id
                                    ? 'border-[#FF4D00] text-[#FF4D00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {myProjects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                    <Inbox className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No projects here yet.</h3>
                    <p className="mt-2 text-gray-400">
                        {currentUser.role === 'athlete' ? "Get started by posting your first project brief." : "Once an athlete accepts your offer, the project will appear here."}
                    </p>
                    {currentUser.role === 'athlete' && (
                        <Button asChild className="mt-6">
                            <Link to="/post-project">Post a Project</Link>
                        </Button>
                    )}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-lg">
                    <Inbox className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-4 text-xl font-semibold text-white">No {activeTab} projects.</h3>
                    <p className="mt-2 text-gray-400">
                       You don't have any projects with this status.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredProjects.map(project => {
                        const acceptedOffer = project.acceptedOfferId ? project.offers.find(o => o.id === project.acceptedOfferId) : null;
                        const creator = acceptedOffer ? getCreatorById(acceptedOffer.creatorId) : null;
                        const hasRated = ratedProjects[project.id];

                        return (
                            <div key={project.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start">
                                    <div>
                                        <Link to={`/project/${project.id}`}><h2 className="text-2xl font-bold text-white hover:text-[#FF4D00]">{project.serviceType}</h2></Link>
                                        <p className="text-gray-400">Sport: {project.sport} | Budget: ${project.budget}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0">{getStatusBadge(project.status)}</div>
                                </div>
                                
                                <div className="mt-6">
                                    {project.status === 'open' && (
                                        <>
                                            {currentUser.role === 'athlete' ? (
                                                <>
                                                 <h3 className="text-lg font-semibold text-white mb-2">Offers Received ({project.offers.length})</h3>
                                                 {project.offers.length > 0 ? (
                                                     <div className="space-y-4">
                                                         {project.offers.map(offer => (
                                                             <div key={offer.id} className="bg-neutral-800 p-4 rounded-md">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <Link to={`/creator/${offer.creatorId}`} className="font-semibold hover:text-[#FF4D00] transition-colors">{getCreatorById(offer.creatorId)?.username || offer.creatorName}</Link>
                                                                        <p className="text-sm text-gray-400">{offer.message}</p>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0 ml-4">
                                                                        <p className="text-lg font-bold text-green-400">${offer.amount}</p>
                                                                        <Button size="sm" onClick={() => handleAcceptOfferClick(project, offer)}>
                                                                            Accept & Pay
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <OfferConversation project={project} offer={offer} />
                                                             </div>
                                                         ))}
                                                     </div>
                                                 ) : (
                                                     <p className="text-gray-500 italic">No offers yet. Check back soon!</p>
                                                 )}
                                                </>
                                            ) : ( // Creator view of open project with their offer
                                                <>
                                                    <h3 className="text-lg font-semibold text-white mb-2">My Offer</h3>
                                                    {project.offers.filter(o => o.creatorId === currentUser.id).map(offer => (
                                                        <div key={offer.id} className="bg-neutral-800 p-4 rounded-md">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-semibold">Your offer: <span className="text-green-400">${offer.amount}</span></p>
                                                                    <p className="text-sm text-gray-400 italic">"{offer.message}"</p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 ml-4">
                                                                    <p className="text-sm text-yellow-300">Pending Athlete Review</p>
                                                                </div>
                                                            </div>
                                                            <OfferConversation project={project} offer={offer} />
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    )}
                                    {project.status === 'in-progress' && creator && (
                                        <div className="bg-neutral-800 p-4 rounded-md text-center">
                                            <p className="font-semibold">Project is in progress with <Link to={`/creator/${creator.id}`} className="text-[#FF4D00] hover:underline">{creator.username}</Link>!</p>
                                            <p className="text-sm text-gray-400 my-4">Use the workspace below to communicate and exchange files.</p>
                                            {currentUser.role === 'athlete' && (
                                                <Button onClick={() => handleMarkComplete(project)}>
                                                    <Check className="mr-2 h-4 w-4"/>
                                                    Mark as Complete
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    {project.status === 'completed' && creator && (
                                        <div className="bg-neutral-800 p-4 rounded-md text-center">
                                            <p className="font-semibold flex items-center justify-center text-green-400 mb-4"><Check className="mr-2 h-5 w-5"/>Project Completed!</p>
                                            {currentUser.role === 'athlete' && (
                                                hasRated ? (
                                                    <p className="text-gray-400">You have rated <Link to={`/creator/${creator.id}`} className="text-[#FF4D00] hover:underline">{creator.username}</Link> for this project.</p>
                                                ) : (
                                                    <>
                                                        <p className="text-gray-300 mb-4">How was your experience with <Link to={`/creator/${creator.id}`} className="text-[#FF4D00] hover:underline">{creator.username}</Link>?</p>
                                                        <Button variant="secondary" onClick={() => setRatingProject(project)}>Rate Creator</Button>
                                                    </>
                                                )
                                            )}
                                        </div>
                                    )}
                                     {project.status === 'disputed' && (
                                        <div className="bg-red-900/30 p-4 rounded-md text-center border border-red-500/50">
                                            <p className="font-semibold flex items-center justify-center text-red-400 mb-2"><Check className="mr-2 h-5 w-5"/>Project Disputed</p>
                                            <p className="text-sm text-gray-300">This project is currently under review by NextArc support. Please check back later for updates.</p>
                                        </div>
                                    )}
                                </div>
                                {(project.status === 'in-progress' || project.status === 'completed' || project.status === 'disputed') && <ProjectWorkspace project={project} />}
                            </div>
                        )
                    })}
                </div>
            )}
            {ratingProject && acceptedOfferForRating && (
                <RatingModal 
                    project={ratingProject}
                    offer={acceptedOfferForRating}
                    onClose={() => setRatingProject(null)}
                    onSubmit={handleRatingSubmit}
                />
            )}
        </div>
    );
};

export default DashboardPage;
