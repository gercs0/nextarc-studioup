
import React, { useState } from 'react';
import { Project, Deliverable, Milestone } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Send, Download, UploadCloud, Loader2, MessageSquare, ListChecks, DollarSign, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '../lib/utils';
import { Input } from './ui/Input';

interface ProjectWorkspaceProps {
    project: Project;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project }) => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'chat' | 'deliverables' | 'milestones' | 'dispute'>('chat');

    if (!currentUser) return null;

    const tabs = [
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'deliverables', label: 'Deliverables', icon: ListChecks },
        { id: 'milestones', label: 'Milestones', icon: DollarSign },
        { id: 'dispute', label: 'Dispute', icon: ShieldAlert },
    ];

    return (
        <div className="mt-6 bg-neutral-800 p-4 rounded-lg">
            <div className="border-b border-neutral-700 mb-4">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                                activeTab === tab.id
                                    ? 'border-[#FF4D00] text-[#FF4D00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            )}
                        >
                            <tab.icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>
                {activeTab === 'chat' && <ChatPanel project={project} />}
                {activeTab === 'deliverables' && <DeliverablesPanel project={project} />}
                {activeTab === 'milestones' && <MilestonesPanel project={project} />}
                {activeTab === 'dispute' && <DisputePanel project={project} />}
            </div>
        </div>
    );
};

const ChatPanel: React.FC<{ project: Project }> = ({ project }) => {
    const { currentUser } = useAuth();
    const { addMessage } = useProjects();
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (!message.trim() || !currentUser) return;
        addMessage(project.id, {
            userId: currentUser.id,
            userName: currentUser.name,
            text: message,
        });
        setMessage('');
    };

    return (
        <div>
            <h4 className="font-semibold text-white mb-2">Project Chat</h4>
            <div className="h-64 overflow-y-auto mb-4 p-2 bg-neutral-900 rounded-md flex flex-col-reverse">
                <div className="space-y-4">
                {[...project.messages].reverse().map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.userId === currentUser!.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-sm ${msg.userId === currentUser!.id ? 'bg-blue-800' : 'bg-neutral-700'}`}>
                            <p className="text-xs font-bold mb-1">{msg.userName}</p>
                            <p className="text-sm break-words">{msg.text}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="flex gap-2">
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." rows={1} className="resize-none" />
                <Button onClick={handleSendMessage} size="icon"><Send size={16} /></Button>
            </div>
        </div>
    );
};

const DeliverablesPanel: React.FC<{ project: Project }> = ({ project }) => {
    const { currentUser } = useAuth();
    const { addDeliverable, requestRevision, approveDeliverable } = useProjects();
    const { addToast } = useToast();
    const { addNotification } = useNotifications();
    const [isUploading, setIsUploading] = useState(false);
    const [revisionModal, setRevisionModal] = useState<{ open: boolean; deliverableId: string | null }>({ open: false, deliverableId: null });
    const [revisionComment, setRevisionComment] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentUser) {
            const file = e.target.files[0];
            setIsUploading(true);
            addToast('Uploading deliverable...', 'info');
            try {
                const fileUrl = await uploadToCloudinary(file);
                addDeliverable(project.id, {
                    creatorId: currentUser.id,
                    fileName: file.name,
                    fileUrl,
                });
                addNotification(
                    project.ownerId,
                    `${currentUser.name} submitted a new deliverable for "${project.serviceType}".`,
                    '/dashboard'
                );
                addToast('File uploaded successfully!', 'success');
            } catch (error) {
                addToast('File upload failed.', 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleRequestRevision = () => {
        if (!revisionModal.deliverableId || !revisionComment.trim()) {
            addToast('Please provide a comment for the revision request.', 'warning');
            return;
        }
        requestRevision(project.id, revisionModal.deliverableId, revisionComment);
        addToast('Revision requested.', 'success');
        setRevisionModal({ open: false, deliverableId: null });
        setRevisionComment('');
    };
    
    const handleApprove = (deliverableId: string) => {
        approveDeliverable(project.id, deliverableId);
        addToast('Deliverable approved!', 'success');
    };

    const getStatusChip = (status: Deliverable['status']) => {
        const styles = {
            submitted: 'bg-blue-900/50 text-blue-300',
            revision_requested: 'bg-yellow-900/50 text-yellow-300',
            approved: 'bg-green-900/50 text-green-300'
        };
        const icons = {
            submitted: <UploadCloud className="h-3 w-3 mr-1.5"/>,
            revision_requested: <RefreshCw className="h-3 w-3 mr-1.5"/>,
            approved: <CheckCircle className="h-3 w-3 mr-1.5"/>
        }
        return (
            <span className={cn('inline-flex items-center px-2 py-1 text-xs font-medium rounded-full', styles[status])}>
                {icons[status]}
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-white">Deliverables</h4>
                {currentUser?.role === 'creator' && project.status === 'in-progress' && (
                    <label htmlFor={`file-upload-${project.id}`} className="cursor-pointer">
                        <Button size="sm" disabled={isUploading} asChild>
                            <span>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4"/>}
                                {isUploading ? 'Uploading...' : 'Upload File'}
                            </span>
                        </Button>
                        <input id={`file-upload-${project.id}`} type="file" className="sr-only" onChange={handleFileUpload} disabled={isUploading}/>
                    </label>
                )}
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {(project.deliverables || []).length > 0 ? (
                    (project.deliverables || []).map(del => (
                        <div key={del.id} className="bg-neutral-900 p-3 rounded-md">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-white truncate pr-2">V{del.version}: {del.fileName}</p>
                                    <p className="text-xs text-gray-400">Uploaded on {new Date(del.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusChip(del.status)}
                                     <a href={del.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                        <Button size="icon" variant="ghost" className="h-8 w-8"><Download size={16} /></Button>
                                    </a>
                                </div>
                           </div>
                           {del.status === 'revision_requested' && (
                               <div className="mt-2 text-xs italic text-yellow-300 bg-yellow-900/30 p-2 rounded">
                                   <strong>Revision Note:</strong> {del.revisionComment}
                                </div>
                           )}
                           {currentUser?.role === 'athlete' && del.status === 'submitted' && (
                               <div className="mt-3 pt-3 border-t border-neutral-700/50 flex justify-end gap-2">
                                   <Button size="sm" variant="outline" onClick={() => setRevisionModal({ open: true, deliverableId: del.id })}>Request Revision</Button>
                                   <Button size="sm" variant="secondary" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(del.id)}>Approve</Button>
                               </div>
                           )}
                        </div>
                    ))
                ) : (
                     <p className="text-sm text-center py-8 text-gray-500 italic">No files submitted yet.</p>
                )}
            </div>

             {revisionModal.open && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setRevisionModal({open: false, deliverableId: null})}>
                    <div className="bg-neutral-900 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Request Revision</h3>
                        <Textarea placeholder="Please describe the changes you'd like to see..." rows={4} value={revisionComment} onChange={(e) => setRevisionComment(e.target.value)} />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setRevisionModal({open: false, deliverableId: null})}>Cancel</Button>
                            <Button onClick={handleRequestRevision}>Submit Request</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MilestonesPanel: React.FC<{ project: Project }> = ({ project }) => {
    const { currentUser } = useAuth();
    const { fundMilestone, releaseMilestone } = useProjects();
    const { addToast } = useToast();

    const handleFund = (milestoneId: string) => {
        if(window.confirm("This will simulate funding this milestone. Proceed?")) {
             fundMilestone(project.id, milestoneId);
             addToast('Milestone funded!', 'success');
        }
    };
     const handleRelease = (milestoneId: string) => {
        if(window.confirm("Are you sure you want to release payment for this milestone? This action cannot be undone.")) {
             releaseMilestone(project.id, milestoneId);
             addToast('Payment released to creator!', 'success');
        }
    };
    
    const getStatusChip = (status: Milestone['status']) => {
        const styles = {
            pending: 'bg-gray-700/50 text-gray-300',
            funded: 'bg-blue-900/50 text-blue-300',
            released: 'bg-green-900/50 text-green-300'
        };
        return <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', styles[status])}>{status}</span>;
    }
    
    if (!project.milestones || project.milestones.length === 0) {
        return <p className="text-sm text-center py-8 text-gray-500 italic">This project does not have milestones.</p>;
    }

    return (
         <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {project.milestones.map(m => (
                 <div key={m.id} className="bg-neutral-900 p-3 rounded-md">
                     <div className="flex justify-between items-center">
                         <div>
                            <p className="font-semibold text-white">{m.description}</p>
                            <p className="text-green-400 font-bold">${m.amount}</p>
                         </div>
                         <div className="flex items-center gap-4">
                            {getStatusChip(m.status)}
                             {currentUser?.role === 'athlete' && m.status === 'pending' && <Button size="sm" onClick={() => handleFund(m.id)}>Fund</Button>}
                             {currentUser?.role === 'athlete' && m.status === 'funded' && <Button size="sm" onClick={() => handleRelease(m.id)}>Release Payment</Button>}
                         </div>
                     </div>
                 </div>
            ))}
        </div>
    );
};

const DisputePanel: React.FC<{ project: Project }> = ({ project }) => {
    const { currentUser } = useAuth();
    const { raiseDispute } = useProjects();
    const { addToast } = useToast();
    const [reason, setReason] = useState('');

    const handleDispute = () => {
        if (!currentUser || !reason.trim()) {
            addToast('Please provide a reason for the dispute.', 'warning');
            return;
        }
        if(window.confirm("Are you sure you want to raise a dispute? This will pause the project and notify NextArc support.")) {
            raiseDispute(project.id, reason, currentUser.role);
            addToast('Dispute raised. Our support team will review it shortly.', 'info');
        }
    }

    if(project.dispute) {
        return (
             <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-red-400"/>
                <h3 className="mt-2 font-bold text-lg text-white">Dispute is Active</h3>
                <p className="text-sm text-red-300 mt-1">Status: <span className="capitalize">{project.dispute.status}</span></p>
                <p className="text-sm text-gray-300 mt-4"><strong>Reason:</strong> {project.dispute.reason}</p>
            </div>
        );
    }

    return (
        <div>
            <h4 className="font-semibold text-white">Raise a Dispute</h4>
            <p className="text-sm text-gray-400 my-2">If you have an issue with this project that you cannot resolve with the other party, you can raise a dispute. Our team will mediate to find a solution. This should be a last resort.</p>
            <Textarea placeholder="Clearly explain the issue..." value={reason} onChange={e => setReason(e.target.value)} rows={4}/>
            <Button variant="destructive" className="mt-4" onClick={handleDispute} disabled={!reason.trim()}>Submit Dispute</Button>
        </div>
    );
}

export default ProjectWorkspace;
