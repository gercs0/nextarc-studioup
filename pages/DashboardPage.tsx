

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useCreators } from '../hooks/useCreators';
import { Button } from '../components/ui/Button';
import { Project, Offer, ProjectStatus } from '../types';
import { incrementCounter } from '../services/countersService';
import { useToast } from '../hooks/useToast';
import Rating from '../components/ui/Rating';
import { Check, Clock, Inbox, User, DollarSign, Briefcase, TrendingUp, Send, CheckCircle, AlertTriangle, PlayCircle, Flag, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProjectWorkspace from '../components/ProjectWorkspace';
import { Textarea } from '../components/ui/Textarea';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { redirectToCheckout } from '../services/stripeService';
import { useNotifications } from '../hooks/useNotifications';
import { LeagueBadge } from '../components/ui/LeagueBadge';
import ProAnalytics from '../components/ProAnalytics';

// --- HUD Component ---
const ProjectHUD: React.FC<{ status: ProjectStatus, hasDispute: boolean }> = ({ status, hasDispute }) => {
    // Visualizing the flow: Open -> In Progress (First Half) -> In Progress (Second Half/Review) -> Completed
    
    const steps = [
        { id: 'kickoff', label: 'Kickoff' },
        { id: 'halftime', label: 'Production' },
        { id: 'final', label: 'Final Whistle' }
    ];

    let currentStepIndex = 0;
    if (status === 'in-progress') currentStepIndex = 1;
    if (status === 'completed') currentStepIndex = 3;

    return (
        <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-6 bg-[#0F0F0F] p-3 rounded-lg border border-neutral-800">
            {hasDispute ? (
                <div className="w-full flex items-center justify-center text-red-500 font-bold uppercase tracking-widest gap-2">
                    <Flag className="h-5 w-5" /> Referee Review (Dispute)
                </div>
            ) : (
                steps.map((step, idx) => {
                    const isActive = currentStepIndex >= idx;
                    const isComplete = currentStepIndex > idx;
                    
                    return (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative z-10">
                                <div className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-300",
                                    isActive ? "bg-[#FF4D00] shadow-[0_0_10px_#FF4D00]" : "bg-neutral-700"
                                )}></div>
                                <span className={cn(
                                    "text-[10px] uppercase font-bold mt-2 tracking-wider",
                                    isActive ? "text-white" : "text-neutral-600"
                                )}>{step.label}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={cn(
                                    "h-0.5 flex-1 mx-2 -mt-4 transition-colors duration-300",
                                    isComplete ? "bg-[#FF4D00]" : "bg-neutral-800"
                                )}></div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};


const RatingModal: React.FC<{ project: Project; offer: Offer; onClose: () => void; onSubmit: (rating: number, comment: string) => void; }> = ({ project, offer, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { getCreatorById } = useCreators();
    const creator = getCreatorById(offer.creatorId);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#121212] border border-neutral-800 rounded-xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="font-syne text-2xl font-bold mb-1 text-white">Rate Your Experience</h2>
                <p className="text-gray-400 mb-2">Request: "{project.serviceType}"</p>
                <p className="text-gray-400 mb-6">Creator: {creator?.username}</p>
                <div className="flex justify-center my-6">
                    <Rating value={rating} onChange={setRating} size={40} />
                </div>
                <div className="my-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">Review</label>
                    <Textarea 
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How did it go?"
                        rows={3}
                        className="bg-neutral-900 border-neutral-700"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={() => onSubmit(rating, comment)} disabled={rating === 0 || !comment.trim()}>Submit</Button>
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
        addNotification(recipientId, `New message from ${currentUser.name} regarding offer on "${project.serviceType}"`, '/dashboard');
        
        setMessage('');
    };

    return (
        <div className="mt-4 pt-4 border-t border-neutral-800">
             <h4 className="font-bold text-xs text-neutral-500 uppercase tracking-wider mb-2">Discussion</h4>
             <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-2">
                {offer.messages.map(msg => (
                    <div key={msg.id} className={`text-xs ${msg.userId === currentUser.id ? 'text-right' : 'text-left'}`}>
                        <span className={`font-bold ${msg.userId === currentUser.id ? 'text-[#FF4D00]' : 'text-neutral-300'}`}>{msg.userName === currentUser.name ? 'You' : msg.userName}: </span>
                        <span className="text-neutral-400">{msg.text}</span>
                    </div>
                ))}
                 {offer.messages.length === 0 && <p className="text-xs text-gray-600 italic">No messages.</p>}
            </div>
            <div className="flex gap-2">
                <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Send message..." className="h-8 text-xs bg-neutral-900 border-neutral-800"/>
                <Button onClick={handleSendMessage} size="sm" variant="secondary" className="h-8 w-8 p-0"><Send size={12} /></Button>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { projects, updateProjectStatus, submitSocialLink } = useProjects();
    const { addRating, getCreatorById } = useCreators();
    const { addToast } = useToast();
    const { addNotification } = useNotifications();
    const [ratingProject, setRatingProject] = useState<Project | null>(null);
    const [ratedProjects, setRatedProjects] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<ProjectStatus>('in-progress');
    const [socialLinkInput, setSocialLinkInput] = useState<Record<string, string>>({});


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
                { label: 'Active', value: myProjects.filter(p => p.status === 'in-progress').length, icon: Briefcase },
                { label: 'Spent', value: `$${totalSpent.toLocaleString()}`, icon: DollarSign },
                { label: 'Done', value: completed.length, icon: Check },
            ];
        }
        if (currentUser.role === 'creator') {
            const completed = myProjects.filter(p => p.status === 'completed');
            const totalEarned = completed.reduce((acc, p) => {
                 const offer = p.offers.find(o => o.id === p.acceptedOfferId);
                return acc + (offer?.amount || 0);
            }, 0);
            return [
                { label: 'Jobs', value: myProjects.filter(p => p.status === 'in-progress').length, icon: Briefcase },
                { label: 'Earned', value: `$${totalEarned.toLocaleString()}`, icon: TrendingUp },
                { label: 'Offers', value: projects.filter(p => p.offers.some(o => o.creatorId === currentUser.id)).length, icon: Send },
            ];
        }
        return [];
    }, [currentUser, myProjects, projects]);

    
    const handleAcceptOfferClick = (project: Project, offer: Offer) => {
        // Trigger the secure checkout flow which redirects to Stripe
        redirectToCheckout(project, offer);
    };
    
    const handleMarkComplete = async (project: Project) => {
        const allDeliverablesApproved = (project.deliverables || []).length > 0 && project.deliverables.every(d => d.status === 'approved');
        const allMilestonesReleased = (project.milestones || []).length === 0 || project.milestones.every(m => m.status === 'released');

        if (!allDeliverablesApproved) {
            addToast('All files must be approved first.', 'warning');
            return;
        }
        if (!allMilestonesReleased) {
            addToast('All payments must be released first.', 'warning');
            return;
        }

        updateProjectStatus(project.id, 'completed');
        const acceptedOffer = project.offers.find(o => o.id === project.acceptedOfferId);
        if (acceptedOffer) {
            addNotification(
                acceptedOffer.creatorId,
                `Request "${project.serviceType}" completed! Payment released.`,
                '/dashboard'
            );
        }
        await incrementCounter('completed');
        addToast('Marked as complete!', 'success');
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
                addToast('Review submitted!', 'success');
            }
        }
        setRatingProject(null);
    };
    
    const handleSubmitSocialLink = (project: Project) => {
        const url = socialLinkInput[project.id];
        if (!url) return;
        submitSocialLink(project.id, url);
        addToast('Link submitted for verification! Reward incoming.', 'success');
    };

    const getStatusBadge = (status: ProjectStatus) => {
        const baseClasses = 'px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full inline-flex items-center';
        switch(status) {
            case 'open':
                return <span className={`${baseClasses} bg-blue-500/10 text-blue-400 border border-blue-500/20`}>Open</span>;
            case 'in-progress':
                return <span className={`${baseClasses} bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`}>Active</span>;
            case 'completed':
                return <span className={`${baseClasses} bg-green-500/10 text-green-400 border border-green-500/20`}>Done</span>;
             case 'disputed':
                return <span className={`${baseClasses} bg-red-500/10 text-red-400 border border-red-500/20`}>Reported</span>;
        }
    };

    const acceptedOfferForRating = ratingProject ? ratingProject.offers.find(o => o.id === ratingProject.acceptedOfferId) : null;

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                <User className="mx-auto h-16 w-16 text-neutral-700" />
                <h3 className="mt-6 text-2xl font-bold text-white font-syne">Dashboard Locked</h3>
                <p className="mt-2 text-gray-500">Please log in to view.</p>
                <Button asChild className="mt-8">
                    <Link to="/login">Log In</Link>
                </Button>
            </div>
        );
    }
    
    const tabs: { id: ProjectStatus, label: string }[] = [
        { id: 'in-progress', label: 'Locker Room (Active)' },
        { id: 'open', label: 'Scouting (Open)' },
        { id: 'completed', label: 'Hall of Fame (History)' },
        { id: 'disputed', label: 'Referee (Issues)' },
    ];


    return (
        <div>
            <div className="mb-12">
                <h1 className="font-syne text-4xl md:text-5xl font-black text-white">Locker Room</h1>
                <p className="mt-2 text-gray-400">Welcome back, {currentUser.name.split(' ')[0]}.</p>
                {currentUser.isFoundingMember && (
                    <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase tracking-widest rounded-full">
                        Founding Member
                    </span>
                )}
            </div>
            
            {/* Pro Analytics - Visible only to Pro Creators */}
            {currentUser.role === 'creator' && currentUser.isPro && (
                <ProAnalytics projects={projects} currentUser={currentUser} />
            )}

            <div className="grid grid-cols-3 gap-4 mb-12">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-[#121212] border border-neutral-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-neutral-500">
                            <stat.icon className="h-4 w-4" />
                            <span className="text-xs uppercase tracking-wider font-medium">{stat.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-neutral-200 font-syne">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mb-8">
                <nav className="flex gap-8 border-b border-neutral-800" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'pb-4 text-sm font-bold uppercase tracking-wide transition-all relative',
                                activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-neutral-500 hover:text-neutral-300'
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF4D00]" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            
            {myProjects.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-neutral-800 rounded-xl bg-[#121212]">
                    <Inbox className="mx-auto h-12 w-12 text-neutral-700" />
                    <h3 className="mt-4 text-xl font-bold text-white font-syne">It's quiet in here.</h3>
                    <p className="mt-2 text-gray-500">
                        {currentUser.role === 'athlete' ? "Post a request to get the ball rolling." : "Bid on projects to fill your locker room."}
                    </p>
                    {currentUser.role === 'athlete' && (
                        <Button asChild className="mt-6 bg-white text-black hover:bg-gray-200">
                            <Link to="/post-project">Post Request</Link>
                        </Button>
                    )}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-neutral-800 rounded-xl bg-[#121212]">
                    <p className="text-gray-500">No {activeTab.replace('-', ' ')} items.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredProjects.map(project => {
                        const acceptedOffer = project.acceptedOfferId ? project.offers.find(o => o.id === project.acceptedOfferId) : null;
                        const creator = acceptedOffer ? getCreatorById(acceptedOffer.creatorId) : null;
                        const hasRated = ratedProjects[project.id];

                        return (
                            <div key={project.id} className="bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                                {/* Header */}
                                <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusBadge(project.status)}
                                            <span className="text-xs text-neutral-500 font-mono font-bold">${project.budget}</span>
                                        </div>
                                        <Link to={`/project/${project.id}`}><h2 className="font-syne text-2xl font-bold text-neutral-200 hover:text-[#FF4D00] transition-colors">{project.serviceType}</h2></Link>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* HUD for Active Projects */}
                                        {project.status === 'in-progress' && (
                                            <ProjectHUD status={project.status} hasDispute={!!project.dispute} />
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-[#161616]">
                                    {project.status === 'open' && (
                                        <>
                                            {currentUser.role === 'athlete' ? (
                                                <>
                                                 <h3 className="font-bold text-neutral-400 mb-4 text-xs uppercase tracking-widest">Offers ({project.offers.length})</h3>
                                                 {project.offers.length > 0 ? (
                                                     <div className="grid gap-4">
                                                         {project.offers.map(offer => {
                                                             const offerCreator = getCreatorById(offer.creatorId);
                                                             return (
                                                             <div key={offer.id} className="bg-[#1C1C1C] border border-neutral-800 p-5 rounded-lg">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Link to={`/creator/${offer.creatorId}`} className="font-bold text-white hover:text-[#FF4D00] text-lg">{offerCreator?.username || offer.creatorName}</Link>
                                                                            {offerCreator?.league && <LeagueBadge league={offerCreator.league} />}
                                                                        </div>
                                                                        <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{offer.message}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-2xl font-bold text-[#FF4D00] font-syne">${offer.amount}</p>
                                                                        <Button size="sm" className="mt-3 w-full" onClick={() => handleAcceptOfferClick(project, offer)}>
                                                                            Draft Creator
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <OfferConversation project={project} offer={offer} />
                                                             </div>
                                                         )})}
                                                     </div>
                                                 ) : (
                                                     <p className="text-neutral-600 italic text-sm">Waiting for talent to apply...</p>
                                                 )}
                                                </>
                                            ) : ( 
                                                <>
                                                    <h3 className="font-bold text-neutral-400 mb-4 text-xs uppercase tracking-widest">My Bid</h3>
                                                    {project.offers.filter(o => o.creatorId === currentUser.id).map(offer => (
                                                        <div key={offer.id} className="bg-[#1C1C1C] border border-neutral-800 p-5 rounded-lg">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <p className="font-bold text-white">Bid Amount: <span className="text-[#FF4D00]">${offer.amount}</span></p>
                                                                <span className="text-xs bg-yellow-900/20 text-yellow-500 px-2 py-1 rounded border border-yellow-900/30">Scouting in progress...</span>
                                                            </div>
                                                            <OfferConversation project={project} offer={offer} />
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    )}
                                    {project.status === 'in-progress' && creator && (
                                        <div className="bg-[#1A1A1A] border border-neutral-800 p-6 rounded-lg text-center">
                                            <p className="text-lg text-neutral-300">Teamed up with <Link to={`/creator/${creator.id}`} className="font-bold text-[#FF4D00] hover:underline">{creator.username}</Link></p>
                                            {creator.league && <div className="mt-2"><LeagueBadge league={creator.league} /></div>}
                                            <p className="text-sm text-neutral-500 mt-4 mb-6">Review footage and provide feedback below.</p>
                                            {currentUser.role === 'athlete' && (
                                                <Button onClick={() => handleMarkComplete(project)} className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                                                    <Check className="mr-2 h-4 w-4"/>
                                                    Finalize & Release Funds
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    {project.status === 'completed' && creator && (
                                        <div className="bg-[#1A1A1A] border border-neutral-800 p-6 rounded-lg text-center">
                                            <p className="font-bold text-green-400 mb-4 flex items-center justify-center gap-2"><CheckCircle size={20}/> Season Complete</p>
                                            {currentUser.role === 'athlete' && (
                                                <div className="space-y-4">
                                                    {hasRated ? (
                                                        <p className="text-neutral-500">You rated <Link to={`/creator/${creator.id}`} className="text-white hover:underline">{creator.username}</Link>.</p>
                                                    ) : (
                                                        <Button variant="outline" onClick={() => setRatingProject(project)}>Rate Experience</Button>
                                                    )}

                                                    <div className="mt-6 pt-6 border-t border-neutral-800">
                                                        <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-center gap-2"><Share2 size={12}/> Post Verification</h5>
                                                        {project.socialStatus === 'published' ? (
                                                             <p className="text-green-500 text-sm">Verified & Published!</p>
                                                        ) : (
                                                            <div className="flex max-w-sm mx-auto gap-2">
                                                                <Input 
                                                                    placeholder="Paste TikTok/Insta link..." 
                                                                    className="text-xs" 
                                                                    value={socialLinkInput[project.id] || ''} 
                                                                    onChange={(e) => setSocialLinkInput({...socialLinkInput, [project.id]: e.target.value})}
                                                                    disabled={project.socialStatus === 'pending'}
                                                                />
                                                                <Button size="sm" onClick={() => handleSubmitSocialLink(project)} disabled={project.socialStatus === 'pending' || !socialLinkInput[project.id]}>
                                                                    {project.socialStatus === 'pending' ? 'Pending' : 'Submit'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] text-gray-500 mt-1">Submit your post link to get featured on NextArc.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                     {project.status === 'disputed' && (
                                        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-lg text-center">
                                            <p className="font-bold text-red-400 flex items-center justify-center gap-2"><AlertTriangle className="h-5 w-5"/> Play Under Review</p>
                                            <p className="text-sm text-neutral-500 mt-2">Admins are reviewing the game footage.</p>
                                        </div>
                                    )}
                                </div>
                                {(project.status === 'in-progress' || project.status === 'completed' || project.status === 'disputed') && (
                                    <div className="border-t border-neutral-800 bg-[#121212]">
                                        <ProjectWorkspace project={project} />
                                    </div>
                                )}
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