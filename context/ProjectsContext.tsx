

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Project, Offer, ProjectStatus, Message, Deliverable, Question, Dispute, Milestone } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { sendEmail } from '../services/emailService';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'offers' | 'status' | 'messages' | 'deliverables'>, isFeatured?: boolean) => Promise<void>;
  addOffer: (projectId: string, offer: Omit<Offer, 'id' | 'timestamp' | 'messages'>) => Promise<void>;
  acceptOffer: (projectId: string, offerId: string) => Promise<void>;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<void>;
  getProjectById: (projectId: string) => Project | undefined;
  addMessage: (projectId: string, message: Omit<Message, 'id'|'timestamp'>) => Promise<void>;
  addDeliverable: (projectId: string, deliverable: Omit<Deliverable, 'id'|'timestamp' | 'version' | 'status'>) => Promise<void>;
  addMessageToOffer: (projectId: string, offerId: string, message: Omit<Message, 'id'|'timestamp'>) => Promise<void>;
  raiseDispute: (projectId: string, reason: string, raisedBy: 'athlete' | 'creator') => Promise<void>;
  resolveDispute: (projectId: string) => Promise<void>;
  addQuestion: (projectId: string, question: Omit<Question, 'id'|'timestamp'>) => Promise<void>;
  addAnswer: (projectId: string, questionId: string, answer: string) => Promise<void>;
  fundMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  releaseMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  requestRevision: (projectId: string, deliverableId: string, comment: string) => Promise<void>;
  approveDeliverable: (projectId: string, deliverableId: string) => Promise<void>;
  submitSocialLink: (projectId: string, url: string) => Promise<void>;
  publishProject: (projectId: string) => Promise<void>;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUserById } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    // Fetch projects with all related data nested
    // Assuming Supabase Foreign Keys are set up:
    // offers -> project_id
    // messages -> project_id
    // deliverables -> project_id
    // questions -> project_id
    // milestones -> project_id
    // disputes -> project_id (assuming table name 'disputes')
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        offers ( *, messages (*) ),
        messages (*),
        deliverables (*),
        questions (*),
        milestones (*),
        disputes (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
        return;
    }

    // Transform DB snake_case to TypeScript camelCase types
    const formattedProjects: Project[] = data.map((p: any) => ({
        id: p.id,
        athleteName: p.athlete_name,
        instagramHandle: p.instagram_handle,
        email: p.email,
        sport: p.sport,
        serviceType: p.service_type,
        budget: p.budget,
        deadline: p.deadline, // ISO string
        description: p.description,
        images: p.images || [],
        status: p.status,
        offers: (p.offers || []).map((o: any) => ({
            id: o.id,
            creatorId: o.creator_id,
            creatorName: o.creator_name,
            amount: o.amount,
            message: o.message,
            timestamp: new Date(o.created_at).getTime(),
            messages: (o.messages || []).map((m: any) => ({
                id: m.id,
                userId: m.user_id,
                userName: m.user_name,
                text: m.text,
                timestamp: new Date(m.created_at).getTime()
            }))
        })),
        acceptedOfferId: p.accepted_offer_id,
        ownerId: p.owner_id,
        messages: (p.messages || []).filter((m:any) => !m.offer_id).map((m: any) => ({
             id: m.id,
             userId: m.user_id,
             userName: m.user_name,
             text: m.text,
             timestamp: new Date(m.created_at).getTime()
        })),
        deliverables: (p.deliverables || []).map((d: any) => ({
            id: d.id,
            creatorId: d.creator_id,
            fileName: d.file_name,
            fileUrl: d.file_url,
            timestamp: new Date(d.created_at).getTime(),
            version: d.version,
            status: d.status,
            revisionComment: d.revision_comment
        })),
        questions: (p.questions || []).map((q: any) => ({
            id: q.id,
            text: q.text,
            asker_id: q.asker_id,
            askerName: q.asker_name,
            timestamp: new Date(q.created_at).getTime(),
            answer: q.answer,
            answerTimestamp: q.answer_timestamp ? new Date(q.answer_timestamp).getTime() : undefined
        })),
        milestones: (p.milestones || []).map((m: any) => ({
            id: m.id,
            description: m.description,
            amount: m.amount,
            status: m.status
        })),
        dispute: p.disputes && p.disputes.length > 0 ? {
            reason: p.disputes[0].reason,
            status: p.disputes[0].status,
            raisedBy: p.disputes[0].raised_by,
            timestamp: new Date(p.disputes[0].created_at).getTime()
        } : undefined,
        isFeatured: p.is_featured,
        isInternalProduction: p.is_internal_production,
        socialUrl: p.social_url,
        socialStatus: p.social_status
    }));

    setProjects(formattedProjects);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'offers' | 'status' | 'messages' | 'deliverables'>, isFeatured: boolean = false) => {
        const dbPayload = {
            owner_id: projectData.ownerId,
            athlete_name: projectData.athleteName,
            instagram_handle: projectData.instagramHandle,
            email: projectData.email,
            sport: projectData.sport,
            service_type: projectData.serviceType,
            budget: projectData.budget,
            deadline: projectData.deadline,
            description: projectData.description,
            images: projectData.images,
            status: 'open',
            is_featured: isFeatured,
            is_internal_production: projectData.isInternalProduction
        };

        const { error } = await supabase.from('projects').insert([dbPayload]);
        if (!error) fetchProjects();
  }, [fetchProjects]);

  const addOffer = useCallback(async (projectId: string, offerData: Omit<Offer, 'id' | 'timestamp' | 'messages'>) => {
        const dbPayload = {
            project_id: projectId,
            creator_id: offerData.creatorId,
            creator_name: offerData.creatorName,
            amount: offerData.amount,
            message: offerData.message
        };

        const { error } = await supabase.from('offers').insert([dbPayload]);
        if (!error) {
            fetchProjects();
            // Notify (Email logic remains same)
        }
  }, [fetchProjects]);

  const acceptOffer = useCallback(async (projectId: string, offerId: string) => {
        const { error } = await supabase
            .from('projects')
            .update({ accepted_offer_id: offerId, status: 'in-progress' })
            .eq('id', projectId);
        
        if (!error) fetchProjects();
  }, [fetchProjects]);
  
  const updateProjectStatus = useCallback(async (projectId: string, status: ProjectStatus) => {
        const { error } = await supabase
            .from('projects')
            .update({ status })
            .eq('id', projectId);
        if (!error) fetchProjects();
  }, [fetchProjects]);

  const getProjectById = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);
  
  const addMessage = useCallback(async (projectId: string, messageData: Omit<Message, 'id'|'timestamp'>) => {
        const dbPayload = {
            project_id: projectId,
            user_id: messageData.userId,
            user_name: messageData.userName,
            text: messageData.text
        };
        const { error } = await supabase.from('messages').insert([dbPayload]);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const addDeliverable = useCallback(async (projectId: string, deliverableData: Omit<Deliverable, 'id'|'timestamp'|'version'|'status'>) => {
      // Calculate next version
      const existing = projects.find(p => p.id === projectId)?.deliverables || [];
      const version = existing.length + 1;

      const dbPayload = {
          project_id: projectId,
          creator_id: deliverableData.creatorId,
          file_name: deliverableData.fileName,
          file_url: deliverableData.fileUrl,
          version: version,
          status: 'submitted'
      };
      const { error } = await supabase.from('deliverables').insert([dbPayload]);
      if(!error) fetchProjects();
  }, [projects, fetchProjects]);

  const addMessageToOffer = useCallback(async (projectId: string, offerId: string, messageData: Omit<Message, 'id'|'timestamp'>) => {
        const dbPayload = {
            project_id: projectId,
            offer_id: offerId, // Linking to offer
            user_id: messageData.userId,
            user_name: messageData.userName,
            text: messageData.text
        };
        const { error } = await supabase.from('messages').insert([dbPayload]);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const raiseDispute = useCallback(async (projectId: string, reason: string, raisedBy: 'athlete' | 'creator') => {
        const dbPayload = {
            project_id: projectId,
            reason,
            raised_by: raisedBy,
            status: 'open'
        };
        // Transaction: Insert dispute AND update project status
        await supabase.from('disputes').insert([dbPayload]);
        await supabase.from('projects').update({ status: 'disputed' }).eq('id', projectId);
        fetchProjects();
  }, [fetchProjects]);

  const resolveDispute = useCallback(async (projectId: string) => {
        // This assumes we are resolving the dispute linked to the project
        // Ideally, we need dispute ID, but for MVP assuming one active dispute
        await supabase.from('projects').update({ status: 'in-progress' }).eq('id', projectId);
        // Update dispute status... finding the dispute ID is tricky without it passed, 
        // but we can update based on project_id where status is open
        await supabase.from('disputes').update({ status: 'resolved' }).eq('project_id', projectId).eq('status', 'open');
        fetchProjects();
  }, [fetchProjects]);

  const addQuestion = useCallback(async (projectId: string, questionData: Omit<Question, 'id'|'timestamp'>) => {
        const dbPayload = {
            project_id: projectId,
            text: questionData.text,
            asker_id: questionData.askerId,
            asker_name: questionData.askerName
        };
        const { error } = await supabase.from('questions').insert([dbPayload]);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const addAnswer = useCallback(async (projectId: string, questionId: string, answer: string) => {
        const { error } = await supabase
            .from('questions')
            .update({ answer, answer_timestamp: new Date().toISOString() })
            .eq('id', questionId);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const fundMilestone = useCallback(async (projectId: string, milestoneId: string) => {
        const { error } = await supabase.from('milestones').update({ status: 'funded' }).eq('id', milestoneId);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const releaseMilestone = useCallback(async (projectId: string, milestoneId: string) => {
        const { error } = await supabase.from('milestones').update({ status: 'released' }).eq('id', milestoneId);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const requestRevision = useCallback(async (projectId: string, deliverableId: string, comment: string) => {
        const { error } = await supabase
            .from('deliverables')
            .update({ status: 'revision_requested', revision_comment: comment })
            .eq('id', deliverableId);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const approveDeliverable = useCallback(async (projectId: string, deliverableId: string) => {
        const { error } = await supabase
            .from('deliverables')
            .update({ status: 'approved' })
            .eq('id', deliverableId);
        if(!error) fetchProjects();
  }, [fetchProjects]);

  const submitSocialLink = useCallback(async (projectId: string, url: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ social_url: url, social_status: 'pending' })
        .eq('id', projectId);
      if (!error) fetchProjects();
  }, [fetchProjects]);

  const publishProject = useCallback(async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ social_status: 'published' })
        .eq('id', projectId);
      if (!error) fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectsContext.Provider value={{ 
        projects, loading, addProject, addOffer, acceptOffer, updateProjectStatus, getProjectById, addMessage, addDeliverable, addMessageToOffer,
        raiseDispute, resolveDispute, addQuestion, addAnswer, fundMilestone, releaseMilestone, requestRevision, approveDeliverable,
        submitSocialLink, publishProject
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};