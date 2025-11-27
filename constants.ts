

export const SPORT_OPTIONS = [
    "Basketball", "Soccer", "Football", "Baseball", "Tennis", "Golf", "Skateboarding", 
    "Snowboarding", "Surfing", "MMA", "Boxing", "Athletics", "Other"
];

export const SERVICE_OPTIONS = [
    "Highlight Reel", "Social Media Content", "Documentary Short", "Brand Collaboration",
    "Photography", "Motion Graphics", "Voiceover", "Other"
];

export const PLATFORM_FEE_PERCENTAGE = 0.08; // 8% Standard Fee
export const PRO_PLATFORM_FEE_PERCENTAGE = 0.04; // 4% Pro Fee

export const GOOGLE_CLIENT_ID: string = ""; 

// Supabase Configuration
export const SUPABASE_URL = "https://eehfrgjcdimakprdkhgh.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlaGZyZ2pjZGltYWtwcmRraGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTkyOTgsImV4cCI6MjA3OTI5NTI5OH0.Ob2Jzwd-wZrXf8NYocI_MGJsiOhjzHMxUHd5z1uKoSI";

export const MOCK_CREATORS = [
    {
        id: 'creator-123',
        username: 'CreativePro',
        bio: 'Specializing in high-impact sports highlight reels and documentary shorts. 10+ years of experience working with professional athletes.',
        profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&fit=crop',
        rating: 4.9,
        ratingsCount: 42,
        reviews: [],
        portfolio: [
            { id: 'p1', title: 'Jalen Green Summer Mixtape', description: 'A high-energy highlight reel showcasing pre-season training.', imageUrl: 'https://images.unsplash.com/photo-1628891890377-57374142f537?q=80&w=800' },
            { id: 'p2', title: 'Maria Sharapova Documentary', description: 'A short film on her comeback story.', imageUrl: 'https://images.unsplash.com/photo-1559521792-a37add0f535a?q=80&w=800' }
        ],
        availability: 'Available',
        isPro: true,
    },
];

export const MOCK_USERS = [];

export const INITIAL_FOLLOWER_COUNT = 225;