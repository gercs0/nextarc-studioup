
import React, { useState } from 'react';
import { Project, Deliverable, Milestone } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Send, Download, UploadCloud, Loader2, MessageSquare, DollarSign, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, FileText, Play, Clock } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '../lib/utils';
import { Input } from './ui/Input';

interface ProjectWorkspaceProps {
    project: Project;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project }) => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'payments' | 'problem'>('chat');

    if (!currentUser) return null;

    const tabs = [
        { id: 'chat', label: 'Film Room (Chat)', icon: MessageSquare },
        { id: 'files', label: 'Deliverables', icon: FileText },
        { id: 'payments', label: 'Contract', icon: DollarSign },
        { id: 'problem', label: 'Report Issue', icon: ShieldAlert },
    ];

    return (
        <div className="mt-0 bg-[#121212] overflow-hidden">
            <div className="border-b border-neutral-800">
                <nav className="flex" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex-1 flex items-center justify-center py-4 text-xs font-bold uppercase tracking-wider transition-colors',
                                activeTab === tab.id
                                    ? 'bg-[#1A1A1A] text-white border-b-2 border-[#FF4D00]'
                                    : 'text-neutral-500 hover:text-white hover:bg-neutral-800/50'
                            )}
                        >
                            <tab.icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-6">
                {activeTab === 'chat' && <ChatPanel project={project} />}
                {activeTab === 'files' && <DeliverablesPanel project={project} />}
                {activeTab === 'payments' && <MilestonesPanel project={project} />}
                {activeTab === 'problem' && <DisputePanel project={project} />}
            </div>
        </div>
    );
};

const ChatPanel: React.FC<{ project: Project }> = ({ project }) => {
    const { currentUser } = useAuth();
    const { addMessage } = useProjects();
    const [message, setMessage] = useState('');
    const [timestamp, setTimestamp] = useState('');

    const handleSendMessage = () => {
        if (!message.trim() || !currentUser) return;
        const fullMessage = timestamp ? `[${timestamp}] ${message}` : message;
        
        addMessage(project.id, {
            userId: currentUser.id,
            userName: currentUser.name,
            text: fullMessage,
            videoTimestamp: timestamp
        });
        setMessage('');
        setTimestamp('');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[500px]">
            {/* Mock Video Player for "Film Room" vibe */}
            <div className="md:w-1/2 bg-black rounded-lg flex items-center justify-center relative border border-neutral-800 group overflow-hidden">
                <img src={project.images[0] || 'https://picsum.photos/800/450?grayscale'} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                <div className="relative z-10 text-center">
                    <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-white/10 hover:bg-[#FF4D00] text-white transition-all backdrop-blur-md">
                        <Play className="h-8 w-8 ml-1" />
                    </Button>
                    <p className="text-neutral-500 text-xs mt-4 font-mono">FILM ROOM PREVIEW</p>
                </div>
                {/* Mock Scrubber */}
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-neutral-700 rounded-full">
                    <div className="w-1/3 h-full bg-[#FF4D00] relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow cursor-pointer"></div>
                    </div>
                </div>
            </div>

            <div className="md:w-1/2 flex flex-col h-full">
                <div className="flex-grow overflow-y-auto mb-4 p-4 bg-[#161616] rounded-lg flex flex-col-reverse border border-neutral-800">
                    <div className="space-y-4">
                    {[...project.messages].reverse().map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.userId === currentUser!.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm border ${msg.userId === currentUser!.id ? 'bg-[#FF4D00]/10 border-[#FF4D00]/20 text-white' : 'bg-[#222] border-neutral-700 text-neutral-300'}`}>
                                <div className="flex justify-between items-center mb-1 gap-2">
                                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-wide">{msg.userName}</span>
                                    {msg.videoTimestamp && (
                                        <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded text-[#FF4D00] flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> {msg.videoTimestamp}
                                        </span>
                                    )}
                                </div>
                                <p className="break-words leading-relaxed">{msg.text.replace(/\[\d{2}:\d{2}\]\s/, '')}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2 bg-[#1A1A1A] p-3 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <Input 
                            value={timestamp} 
                            onChange={e => setTimestamp(e.target.value)} 
                            placeholder="00:00" 
                            className="h-6 w-20 text-xs bg-[#111] border-neutral-700 font-mono text-[#FF4D00] placeholder:text-neutral-600"
                        />
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Timestamp Ref</span>
                    </div>
                    <div className="flex gap-2">
                        <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type feedback..." className="flex-grow bg-[#111] border-neutral-700 focus:border-[#FF4D00]" onKeyDown={e => e.key === 'Enter' && handleSendMessage()}/>
                        <Button onClick={handleSendMessage} size="icon" className="shrink-0 bg-white text-black hover:bg-neutral-200"><Send size={18} /></Button>
                    </div>
                </div>
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
            addToast('Uploading file...', 'info');
            try {
                const fileUrl = await uploadToCloudinary(file);
                addDeliverable(project.id, {
                    creatorId: currentUser.id,
                    fileName: file.name,
                    fileUrl,
                });
                addNotification(
                    project.ownerId,
                    `${currentUser.name} uploaded a file for "${project.serviceType}".`,
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
            addToast('Please explain what needs to change.', 'warning');
            return;
        }
        requestRevision(project.id, revisionModal.deliverableId, revisionComment);
        addToast('Revision requested.', 'success');
        setRevisionModal({ open: false, deliverableId: null });
        setRevisionComment('');
    };
    
    const handleApprove = (deliverableId: string) => {
        approveDeliverable(project.id, deliverableId);
        addToast('File approved!', 'success');
    };

    const getStatusChip = (status: Deliverable['status']) => {
        const styles = {
            submitted: 'bg-blue-900/20 text-blue-400 border-blue-800/50',
            revision_requested: 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50',
            approved: 'bg-green-900/20 text-green-400 border-green-800/50'
        };
        return (
            <span className={cn('inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded border', styles[status])}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-neutral-200 font-syne text-lg">Project Files</h4>
                {currentUser?.role === 'creator' && project.status === 'in-progress' && (
                    <label htmlFor={`file-upload-${project.id}`} className="cursor-pointer">
                        <div className={cn(Button({size: "sm"}), "cursor-pointer bg-white text-black hover:bg-neutral-200")}>
                             {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4"/>}
                             {isUploading ? 'Uploading...' : 'Upload File'}
                        </div>
                        <input id={`file-upload-${project.id}`} type="file" className="sr-only" onChange={handleFileUpload} disabled={isUploading}/>
                    </label>
                )}
            </div>
            <div className="space-y-3">
                {(project.deliverables || []).length > 0 ? (
                    (project.deliverables || []).map(del => (
                        <div key={del.id} className="bg-[#161616] border border-neutral-800 p-4 rounded-lg">
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#222] p-2 rounded">
                                        <FileText className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{del.fileName}</p>
                                        <p className="text-xs text-neutral-500">Version {del.version} • {new Date(del.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                    {getStatusChip(del.status)}
                                     <a href={del.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                        <Button size="sm" variant="ghost" className="hover:bg-white/5 text-neutral-400 hover:text-white"><Download size={16} /></Button>
                                    </a>
                                </div>
                           </div>
                           {del.status === 'revision_requested' && (
                               <div className="mt-3 text-xs text-yellow-400 bg-yellow-900/10 p-3 rounded border border-yellow-900/30">
                                   <strong>Feedback:</strong> {del.revisionComment}
                                </div>
                           )}
                           {currentUser?.role === 'athlete' && del.status === 'submitted' && (
                               <div className="mt-4 flex gap-3">
                                   <Button size="sm" variant="outline" className="flex-1 border-neutral-700" onClick={() => setRevisionModal({ open: true, deliverableId: del.id })}>Request Changes</Button>
                                   <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white border-transparent" onClick={() => handleApprove(del.id)}>Approve File</Button>
                               </div>
                           )}
                        </div>
                    ))
                ) : (
                     <div className="text-center py-12 bg-[#161616] rounded-lg border border-dashed border-neutral-800">
                         <FileText className="mx-auto h-8 w-8 text-neutral-700 mb-2" />
                         <p className="text-sm text-neutral-500">No files uploaded yet.</p>
                     </div>
                )}
            </div>

             {revisionModal.open && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setRevisionModal({open: false, deliverableId: null})}>
                    <div className="bg-[#121212] border border-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 font-syne text-white">Request Changes</h3>
                        <Textarea placeholder="What needs to be adjusted?" rows={4} value={revisionComment} onChange={(e) => setRevisionComment(e.target.value)} className="bg-[#1A1A1A] border-neutral-700 focus:border-[#FF4D00]" />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="ghost" onClick={() => setRevisionModal({open: false, deliverableId: null})}>Cancel</Button>
                            <Button onClick={handleRequestRevision}>Send Request</Button>
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
        if(window.confirm("This will simulate funding this payment stage. Proceed?")) {
             fundMilestone(project.id, milestoneId);
             addToast('Stage funded!', 'success');
        }
    };
     const handleRelease = (milestoneId: string) => {
        if(window.confirm("Are you sure you want to release payment for this stage? This action cannot be undone.")) {
             releaseMilestone(project.id, milestoneId);
             addToast('Payment released to creator!', 'success');
        }
    };
    
    const getStatusChip = (status: Milestone['status']) => {
        const styles = {
            pending: 'bg-neutral-800 text-neutral-500',
            funded: 'bg-blue-900/30 text-blue-400',
            released: 'bg-green-900/30 text-green-400'
        };
        return <span className={cn('px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded', styles[status])}>{status}</span>;
    }
    
    if (!project.milestones || project.milestones.length === 0) {
        return (
             <div className="text-center py-12 bg-[#161616] rounded-lg border border-dashed border-neutral-800">
                 <DollarSign className="mx-auto h-8 w-8 text-neutral-700 mb-2" />
                 <p className="text-sm text-neutral-500">Single payment contract upon completion.</p>
             </div>
        );
    }

    return (
         <div className="space-y-3">
            {project.milestones.map(m => (
                 <div key={m.id} className="bg-[#161616] border border-neutral-800 p-4 rounded-lg flex items-center justify-between">
                     <div>
                        <p className="font-bold text-white">{m.description}</p>
                        <p className="text-[#FF4D00] font-mono text-sm mt-1">${m.amount}</p>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        {getStatusChip(m.status)}
                         {currentUser?.role === 'athlete' && m.status === 'pending' && <Button size="sm" variant="outline" onClick={() => handleFund(m.id)}>Fund</Button>}
                         {currentUser?.role === 'athlete' && m.status === 'funded' && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none" onClick={() => handleRelease(m.id)}>Release</Button>}
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
            addToast('Please provide a reason.', 'warning');
            return;
        }
        if(window.confirm("Are you sure you want to report an issue? This will pause the request and notify support.")) {
            raiseDispute(project.id, reason, currentUser.role);
            addToast('Issue reported.', 'info');
        }
    }

    if(project.dispute) {
        return (
             <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-lg text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4"/>
                <h3 className="font-syne font-bold text-xl text-white">Report Submitted</h3>
                <p className="text-sm text-red-400 mt-1 uppercase tracking-wide">Status: {project.dispute.status}</p>
                <p className="text-neutral-400 mt-4 bg-black/20 p-4 rounded text-sm">"{project.dispute.reason}"</p>
            </div>
        );
    }

    return (
        <div>
            <h4 className="font-bold text-white font-syne text-lg mb-2">Report a Problem</h4>
            <p className="text-sm text-neutral-400 mb-4">Something wrong? Let us know and we'll help resolve it.</p>
            <Textarea placeholder="Describe the issue..." value={reason} onChange={e => setReason(e.target.value)} rows={4} className="bg-[#1A1A1A] border-neutral-800"/>
            <Button variant="destructive" className="mt-4 w-full sm:w-auto" onClick={handleDispute} disabled={!reason.trim()}>Submit Report</Button>
        </div>
    );
}

export default ProjectWorkspace;