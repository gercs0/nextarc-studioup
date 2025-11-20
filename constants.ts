
export const SPORT_OPTIONS = [
    "Basketball", "Soccer", "Football", "Baseball", "Tennis", "Golf", "Skateboarding", 
    "Snowboarding", "Surfing", "MMA", "Boxing", "Athletics", "Other"
];

export const SERVICE_OPTIONS = [
    "Highlight Reel", "Social Media Content", "Documentary Short", "Brand Collaboration",
    "Photography", "Motion Graphics", "Voiceover", "Other"
];

export const PLATFORM_FEE_PERCENTAGE = 0.08; // 8%

// To get a real Google Client ID:
// 1. Go to https://console.cloud.google.com/
// 2. Create a project & configure OAuth consent screen
// 3. Create credentials > OAuth client ID > Web application
// 4. Add your domain (e.g., localhost, vercel.app) to "Authorized Javascript Origins"
// 5. Paste the Client ID below (it usually ends in .apps.googleusercontent.com)
export const GOOGLE_CLIENT_ID: string = ""; 

export const MOCK_CREATORS = [
    {
        id: 'creator-123',
        username: 'CreativePro',
        bio: 'Specializing in high-impact sports highlight reels and documentary shorts. 10+ years of experience working with professional athletes.',
        profilePictureUrl: 'https://i.pravatar.cc/150?u=creator-123',
        rating: 4.8,
        ratingsCount: 25,
        reviews: [],
        portfolio: [
            { id: 'p1', title: 'Jalen Green Summer Mixtape', description: 'A high-energy highlight reel showcasing pre-season training.', imageUrl: 'https://images.unsplash.com/photo-1628891890377-57374142f537?q=80&w=800' },
            { id: 'p2', title: 'Maria Sharapova Documentary', description: 'A short film on her comeback story.', imageUrl: 'https://images.unsplash.com/photo-1559521792-a37add0f535a?q=80&w=800' }
        ],
    },
    {
        id: 'creator-456',
        username: 'PixelPerfect',
        bio: 'Photographer and motion graphics artist. I bring a cinematic quality to every project, from on-field action to brand collaborations.',
        profilePictureUrl: 'https://i.pravatar.cc/150?u=creator-456',
        rating: 4.9,
        ratingsCount: 18,
        reviews: [],
        portfolio: [
             { id: 'p3', title: 'Nike "Air" Campaign', description: 'Action shots for a global sneaker launch.', imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800' },
             { id: 'p4', title: 'Skate Culture Showcase', description: 'Gritty, authentic photography of local skate scene.', imageUrl: 'https://images.unsplash.com/photo-1547422690-384b2e2e9877?q=80&w=800' }
        ],
    }
];

export const INITIAL_FOLLOWER_COUNT = 225; // Based on https://www.instagram.com/nextarc_media/