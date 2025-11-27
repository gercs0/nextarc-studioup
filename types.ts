

export type UserRole = 'athlete' | 'creator';

export type League = 'Rookie' | 'Varsity' | 'Pro' | 'All-Star';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // For simulation, not for production
  verified?: boolean;
  isVerified?: boolean; // For athlete verification
  twoFactorEnabled?: boolean;
  savedProjects?: string[];
  isAdmin?: boolean;
  isFoundingMember?: boolean;
}

export interface Review {
  id: string;
  projectId: string;
  projectName: string;
  athleteId: string;
  athleteName: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Creator {
  id: string; // This ID should match the User ID
  username: string;
  bio: string;
  profilePictureUrl: string;
  rating: number;
  ratingsCount: number;
  reviews: Review[];
  portfolio: PortfolioItem[];
  isPro?: boolean;
  availability?: string;
  league?: League; // Derived from stats
  completedJobs?: number;
}

export interface Offer {
  id:string;
  creatorId: string;
  creatorName: string;
  amount: number;
  message: string;
  timestamp: number;
  messages: Message[];
}

export type ProjectStatus = "open" | "in-progress" | "completed" | "disputed";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  videoTimestamp?: string; // For "Film Room" feedback (e.g., "00:45")
}

export interface Deliverable {
  id: string;
  creatorId: string;
  fileName: string;
  fileUrl: string;
  timestamp: number;
  version: number;
  status: 'submitted' | 'revision_requested' | 'approved';
  revisionComment?: string;
}

export interface Question {
  id: string;
  text: string;
  askerId: string;
  askerName: string;
  timestamp: number;
  answer?: string;
  answerTimestamp?: number;
}

export interface Milestone {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'funded' | 'released';
}

export interface Dispute {
  reason: string;
  status: 'open' | 'resolved';
  raisedBy: 'athlete' | 'creator';
  timestamp: number;
}


export interface Notification {
  id: string;
  message: string;
  link: string;
  timestamp: number;
  read: boolean;
}

export interface Project {
  id: string;
  athleteName: string;
  instagramHandle?: string;
  email: string;
  sport: string;
  serviceType: string;
  budget: number;
  deadline: string;
  description: string;
  images: string[];
  status: ProjectStatus;
  offers: Offer[];
  acceptedOfferId?: string;
  ownerId: string; 
  messages: Message[];
  deliverables: Deliverable[];
  isFeatured?: boolean;
  questions?: Question[];
  milestones?: Milestone[];
  dispute?: Dispute;
}

export interface Counters {
  followers: number;
  athletes: number;
  projects: number;
  completed: number;
}