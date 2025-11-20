
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useCreators } from '../hooks/useCreators';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';
import { Project, Offer } from '../types';
import { Button } from '../components/ui/Button';
import { Calendar, DollarSign, Tag, User, Briefcase, ArrowLeft, MessageSquare } from 'lucide-react';
import MakeOfferModal from '../components/MakeOfferModal';
import { Textarea } from '../components/ui/Textarea';

const ProjectDetailPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { getProjectById, addOffer, addQuestion, addAnswer } = useProjects();
    const { getCreatorById } = useCreators();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { addNotification } = useNotifications();

    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [answerText, setAnswerText] = useState<Record<string, string>>({});
    
    const project = projectId ? getProjectById(projectId) : undefined;

    if (!project) {
        return (
            <div className="text-center py-20">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Project not found</h1>
                <p className="mt-6 text-base leading-7 text-gray-300">Sorry, we couldn’t find a project with that ID.</p>
                <div className="mt-10">
                    <Button asChild>
                        <Link to="/browse">Browse Projects</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleOfferSubmit = (offer: Omit<Offer, 'id' | 'timestamp' | 'messages'>) => {
        if (currentUser) {
            addOffer(project.id, offer);
            addNotification(
                project.ownerId,
                `${currentUser.name} made an offer on your project "${project.serviceType}".`,
                '/dashboard'
            );
            addToast('Offer submitted successfully!', 'success');
            setIsOfferModalOpen(false);
        }
    };

    const handleAskQuestion = () => {
        if (!currentUser || !questionText.trim() || !projectId) return;
        addQuestion(projectId, {
            text: questionText,
            askerId: currentUser.id,
            askerName: currentUser.name,
        });
        addNotification(
            project.ownerId,
            `${currentUser.name} asked a question on your project "${project.serviceType}".`,
            `/project/${projectId}`
        );
        setQuestionText('');
        addToast('Question posted!', 'success');
    };
    
    const handleAnswerSubmit = (questionId: string) => {
        const answer = answerText[questionId];
        if (!answer.trim() || !projectId) return;
        
        const question = project.questions?.find(q => q.id === questionId);
        if(!question) return;

        addAnswer(projectId, questionId, answer);
        addNotification(
            question.askerId,
            `${project.athleteName} answered your question on "${project.serviceType}".`,
            `/project/${projectId}`
        );
        addToast('Answer posted!', 'success');
    };

    const isOwner = currentUser?.id === project.ownerId;

    return (
        <div>
            <div className="mb-8">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-[#FF4D00] uppercase tracking-wider">{project.sport}</p>
                        <h1 className="text-4xl font-black tracking-tighter text-white mt-1">{project.serviceType}</h1>
                        <p className="mt-4 text-lg text-gray-300">{project.description}</p>
                        
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                             <h3 className="text-xl font-bold text-white mb-4">Reference Media</h3>
                             {project.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {project.images.map((img, index) => (
                                        <a href={img} target="_blank" rel="noopener noreferrer" key={index}>
                                            <img src={img} alt={`Reference ${index + 1}`} className="rounded-lg object-cover h-32 w-full hover:opacity-80 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                             ) : <p className="text-gray-500 italic">No reference media provided.</p>}
                        </div>
                    </div>

                    {/* Right Column - Meta */}
                    <div className="md:col-span-1">
                        <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Project Info</h2>
                                {isOwner && (
                                     <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-900 text-blue-300">My Project</span>
                                )}
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-3 text-gray-400" />
                                    <span>Budget: <span className="font-bold text-green-400">${project.budget}</span></span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                                    <span>Deadline: {new Date(project.deadline + 'T00:00:00').toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <Tag className="h-4 w-4 mr-3 text-gray-400" />
                                    <span>Service: {project.serviceType}</span>
                                </div>
                                 <div className="flex items-center">
                                    <User className="h-4 w-4 mr-3 text-gray-400" />
                                    <span>Athlete: {project.athleteName}</span>
                                </div>
                            </div>
                            {!isOwner && project.status === 'open' && (
                                <Button className="w-full mt-6" onClick={() => setIsOfferModalOpen(true)}>
                                   <Briefcase className="mr-2 h-4 w-4" /> Make an Offer
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {project.status === 'open' && (
                 <div className="mt-12">
                     <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><MessageSquare className="mr-3 h-6 w-6"/> Public Q&A</h2>
                     <div className="space-y-6">
                         {(project.questions || []).map(q => (
                             <div key={q.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                                 <p className="text-sm text-gray-400">
                                     <span className="font-bold text-white">{q.askerName}</span> asked:
                                 </p>
                                 <p className="mt-1 text-gray-200">{q.text}</p>
                                 {q.answer ? (
                                     <div className="mt-3 pt-3 border-t border-neutral-700/50">
                                         <p className="text-sm text-gray-400"><span className="font-bold text-white">{project.athleteName}</span> answered:</p>
                                         <p className="mt-1 text-gray-200">{q.answer}</p>
                                     </div>
                                 ) : isOwner ? (
                                     <div className="mt-3 pt-3 border-t border-neutral-700/50">
                                        <Textarea placeholder="Type your answer..." className="text-sm" rows={2} value={answerText[q.id] || ''} onChange={e => setAnswerText({...answerText, [q.id]: e.target.value})} />
                                        <Button size="sm" className="mt-2" onClick={() => handleAnswerSubmit(q.id)}>Post Answer</Button>
                                     </div>
                                 ) : (
                                     <p className="mt-3 text-xs text-gray-500 italic">Awaiting answer from athlete...</p>
                                 )}
                             </div>
                         ))}
                         
                         {currentUser && !isOwner && (
                            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
                                <h3 className="font-semibold text-white">Ask a question</h3>
                                <Textarea className="mt-2" placeholder="Have a question about the project? Ask it here." value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
                                <Button className="mt-2" onClick={handleAskQuestion} disabled={!questionText.trim()}>Post Question</Button>
                            </div>
                         )}
                     </div>
                 </div>
            )}
            
            {isOfferModalOpen && (
                <MakeOfferModal 
                    project={project}
                    onClose={() => setIsOfferModalOpen(false)}
                    onSubmit={handleOfferSubmit}
                />
            )}
        </div>
    );
};

export default ProjectDetailPage;
