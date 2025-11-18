import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Project, Offer, ProjectStatus, Message, Deliverable, Question, Dispute, Milestone } from '../types';
import { SEED_PROJECTS } from '../data/seed';
import { sendEmail } from '../services/emailService';
import { useAuth } from './AuthContext';

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
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUserById } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
        const localData = localStorage.getItem('projects');
        if (localData) {
            try {
                const parsedData = JSON.parse(localData);
                if (Array.isArray(parsedData)) {
                    setProjects(parsedData);
                }
            } catch (error) {
                console.error("Could not parse projects from localStorage. Seeding new data.", error);
                localStorage.setItem('projects', JSON.stringify(SEED_PROJECTS));
                setProjects(SEED_PROJECTS);
            }
        } else {
             localStorage.setItem('projects', JSON.stringify(SEED_PROJECTS));
             setProjects(SEED_PROJECTS);
        }
        setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  useEffect(() => {
    // Prevent writing to localStorage on initial empty state
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'offers' | 'status' | 'messages' | 'deliverables'>, isFeatured: boolean = false) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            const newProject: Project = {
              ...projectData,
              id: `proj_${Date.now()}`,
              offers: [],
              status: 'open',
              messages: [],
              deliverables: [],
              questions: [],
              isFeatured,
            };
            setProjects(prev => [newProject, ...prev]);
            resolve();
        }, 500);
    });
  }, []);

  const addOffer = useCallback(async (projectId: string, offerData: Omit<Offer, 'id' | 'timestamp' | 'messages'>) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            const newOffer: Offer = {
              ...offerData,
              id: `offer_${Date.now()}`,
              timestamp: Date.now(),
              messages: [],
            };
            let offeredProject: Project | undefined;
            setProjects(prev => {
                const newProjects = prev.map(p => {
                    if (p.id === projectId) {
                        offeredProject = { ...p, offers: [...p.offers, newOffer] };
                        return offeredProject;
                    }
                    return p;
                });
                return newProjects;
            });
            
            const athlete = offeredProject ? getUserById(offeredProject.ownerId) : null;
            if(offeredProject && athlete) {
                sendEmail(athlete.email, `New Offer on your project: ${offeredProject.serviceType}`, `${offerData.creatorName} has made a $${offerData.amount} offer on your project.`);
            }
            resolve();
        }, 500);
    });
  }, [getUserById]);

  const acceptOffer = useCallback(async (projectId: string, offerId: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            let acceptedProject: Project | undefined;
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    acceptedProject = { ...p, acceptedOfferId: offerId, status: 'in-progress' };
                    return acceptedProject;
                }
                return p;
            }));
            const offer = acceptedProject?.offers.find(o => o.id === offerId);
            const creator = offer ? getUserById(offer.creatorId) : null;
             if(acceptedProject && creator) {
                sendEmail(creator.email, `Your offer was accepted!`, `Congratulations! Your offer for "${acceptedProject.serviceType}" has been accepted by ${acceptedProject.athleteName}.`);
            }
            resolve();
        }, 500);
    });
  }, [getUserById]);
  
  const updateProjectStatus = useCallback(async (projectId: string, status: ProjectStatus) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            setProjects(prev => prev.map(p =>
              p.id === projectId ? { ...p, status } : p
            ));
            resolve();
        }, 300);
    });
  }, []);

  const getProjectById = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);
  
  const addMessage = useCallback(async (projectId: string, messageData: Omit<Message, 'id'|'timestamp'>) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            const newMessage: Message = {
                ...messageData,
                id: `msg_${Date.now()}`,
                timestamp: Date.now()
            };
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, messages: [...p.messages, newMessage] } : p
            ));
            resolve();
        }, 200);
    });
  }, []);

  const addDeliverable = useCallback(async (projectId: string, deliverableData: Omit<Deliverable, 'id'|'timestamp'|'version'|'status'>) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setProjects(prev => prev.map(p => {
              if (p.id !== projectId) return p;
              const newVersion = (p.deliverables?.length || 0) + 1;
              const newDeliverable: Deliverable = {
                  ...deliverableData,
                  id: `del_${Date.now()}`,
                  timestamp: Date.now(),
                  version: newVersion,
                  status: 'submitted',
              };
              return { ...p, deliverables: [...(p.deliverables || []), newDeliverable] };
          }));
          resolve();
        }, 500);
      });
  }, []);

  const addMessageToOffer = useCallback(async (projectId: string, offerId: string, messageData: Omit<Message, 'id'|'timestamp'>) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            const newMessage: Message = {
                ...messageData,
                id: `offermsg_${Date.now()}`,
                timestamp: Date.now()
            };
             setProjects(prev => prev.map(p => {
                if (p.id !== projectId) return p;
                const updatedOffers = p.offers.map(o => {
                    if (o.id !== offerId) return o;
                    return { ...o, messages: [...o.messages, newMessage] };
                });
                return { ...p, offers: updatedOffers };
            }));
            resolve();
        }, 200);
    });
  }, []);

  const raiseDispute = useCallback(async (projectId: string, reason: string, raisedBy: 'athlete' | 'creator') => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            const newDispute: Dispute = {
                reason,
                raisedBy,
                status: 'open',
                timestamp: Date.now(),
            };
            setProjects(prev => prev.map(p => 
                p.id === projectId ? { ...p, status: 'disputed', dispute: newDispute } : p
            ));
            resolve();
        }, 500);
    });
  }, []);

  const resolveDispute = useCallback(async (projectId: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            setProjects(prev => prev.map(p => {
                if (p.id === projectId && p.dispute) {
                    return { ...p, status: 'in-progress', dispute: { ...p.dispute, status: 'resolved' } };
                }
                return p;
            }));
            resolve();
        }, 500);
    });
  }, []);

  const addQuestion = useCallback(async (projectId: string, questionData: Omit<Question, 'id'|'timestamp'>) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            const newQuestion: Question = { ...questionData, id: `q_${Date.now()}`, timestamp: Date.now() };
            setProjects(prev => prev.map(p =>
              p.id === projectId ? { ...p, questions: [...(p.questions || []), newQuestion] } : p
            ));
            resolve();
        }, 500);
    });
  }, []);

  const addAnswer = useCallback(async (projectId: string, questionId: string, answer: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            setProjects(prev => prev.map(p => {
                if (p.id !== projectId) return p;
                const updatedQuestions = (p.questions || []).map(q => 
                    q.id === questionId ? { ...q, answer, answerTimestamp: Date.now() } : q
                );
                return { ...p, questions: updatedQuestions };
            }));
            resolve();
        }, 300);
    });
  }, []);

  const fundMilestone = useCallback(async (projectId: string, milestoneId: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            setProjects(prev => prev.map(p => {
                if (p.id !== projectId) return p;
                const updatedMilestones = (p.milestones || []).map(m =>
                    m.id === milestoneId ? { ...m, status: 'funded' } : m
                );
                return { ...p, milestones: updatedMilestones };
            }));
            resolve();
        }, 500);
    });
  }, []);

  const releaseMilestone = useCallback(async (projectId: string, milestoneId: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
              setProjects(prev => prev.map(p => {
                  if (p.id !== projectId) return p;
                  const updatedMilestones = (p.milestones || []).map(m =>
                      m.id === milestoneId ? { ...m, status: 'released' } : m
                  );
                  return { ...p, milestones: updatedMilestones };
              }));
              resolve();
        }, 500);
      });
  }, []);

  const requestRevision = useCallback(async (projectId: string, deliverableId: string, comment: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
              setProjects(prev => prev.map(p => {
                  if (p.id !== projectId) return p;
                  const updatedDeliverables = (p.deliverables || []).map(d =>
                      d.id === deliverableId ? { ...d, status: 'revision_requested', revisionComment: comment } : d
                  );
                  return { ...p, deliverables: updatedDeliverables };
              }));
              resolve();
        }, 500);
      });
  }, []);

  const approveDeliverable = useCallback(async (projectId: string, deliverableId: string) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
              setProjects(prev => prev.map(p => {
                  if (p.id !== projectId) return p;
                  const updatedDeliverables = (p.deliverables || []).map(d =>
                      d.id === deliverableId ? { ...d, status: 'approved' } : d
                  );
                  return { ...p, deliverables: updatedDeliverables };
              }));
              resolve();
        }, 500);
      });
  }, []);

  return (
    <ProjectsContext.Provider value={{ 
        projects, loading, addProject, addOffer, acceptOffer, updateProjectStatus, getProjectById, addMessage, addDeliverable, addMessageToOffer,
        raiseDispute, resolveDispute, addQuestion, addAnswer, fundMilestone, releaseMilestone, requestRevision, approveDeliverable
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};