
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Creator, User, Review } from '../types';
import { supabase } from '../lib/supabase';

interface CreatorsContextType {
  creators: Creator[];
  loading: boolean;
  addCreator: (user: User) => Promise<void>;
  updateCreatorProfile: (creatorId: string, profileData: Partial<Pick<Creator, 'username' | 'bio' | 'profilePictureUrl'>>) => Promise<void>;
  addRating: (creatorId: string, review: Omit<Review, 'id' | 'timestamp'>) => Promise<void>;
  getCreatorById: (creatorId: string) => Creator | undefined;
  upgradeToPro: (creatorId: string) => Promise<void>;
  updateAvailability: (creatorId: string, availability: string) => Promise<void>;
}

export const CreatorsContext = createContext<CreatorsContextType | undefined>(undefined);

export const CreatorsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    
    // Fetch profiles where role is creator
    // Also fetch related portfolio items and reviews
    // Assumes tables: profiles, portfolio_items, reviews
    
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            portfolio_items (*),
            reviews (*)
        `)
        .eq('role', 'creator');
    
    if (error) {
        console.error("Error fetching creators:", error);
        setLoading(false);
        return;
    }

    const formattedCreators: Creator[] = data.map((p: any) => ({
        id: p.id,
        username: p.name, // Mapping name to username for display
        bio: p.bio || 'No bio yet.',
        profilePictureUrl: p.profile_picture_url || `https://i.pravatar.cc/150?u=${p.id}`,
        rating: p.rating || 0,
        ratingsCount: p.ratings_count || 0,
        isPro: p.is_pro,
        availability: p.availability || 'Available',
        portfolio: (p.portfolio_items || []).map((i: any) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            imageUrl: i.image_url
        })),
        reviews: (p.reviews || []).map((r: any) => ({
            id: r.id,
            projectId: r.project_id,
            projectName: r.project_name,
            athleteId: r.athlete_id,
            athleteName: r.athlete_name,
            rating: r.rating,
            comment: r.comment,
            timestamp: new Date(r.created_at).getTime()
        }))
    }));
    
    setCreators(formattedCreators);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const addCreator = useCallback(async (user: User) => {
      // This is redundant with AuthContext signup, but handles logic specific to creator list if separate table exists.
      // Since we use 'profiles', user is already added.
      // We might trigger a fetch just in case.
      fetchCreators();
  }, [fetchCreators]);

  const updateCreatorProfile = useCallback(async (creatorId: string, profileData: Partial<Pick<Creator, 'username' | 'bio' | 'profilePictureUrl'>>) => {
        const dbPayload: any = {};
        if (profileData.username) dbPayload.name = profileData.username;
        if (profileData.bio) dbPayload.bio = profileData.bio;
        if (profileData.profilePictureUrl) dbPayload.profile_picture_url = profileData.profilePictureUrl;

        const { error } = await supabase.from('profiles').update(dbPayload).eq('id', creatorId);
        if (!error) fetchCreators();
  }, [fetchCreators]);

  const addRating = useCallback(async (creatorId: string, reviewData: Omit<Review, 'id' | 'timestamp'>) => {
        // 1. Insert Review
        const { error } = await supabase.from('reviews').insert([{
            creator_id: creatorId,
            project_id: reviewData.projectId,
            project_name: reviewData.projectName,
            athlete_id: reviewData.athleteId,
            athlete_name: reviewData.athleteName,
            rating: reviewData.rating,
            comment: reviewData.comment
        }]);
        
        if (error) return;

        // 2. Recalculate Average (Simple approach for MVP: Fetch all and update, or use DB Trigger/Function)
        // For now, we rely on the next fetch or we can trigger a specific RPC if created.
        // Here, assuming DB trigger handles rating average, or we update it manually:
        
        const creator = creators.find(c => c.id === creatorId);
        if (creator) {
            const newCount = creator.ratingsCount + 1;
            const newTotal = (creator.rating * creator.ratingsCount) + reviewData.rating;
            const newAvg = newTotal / newCount;
            
            await supabase.from('profiles').update({
                rating: newAvg,
                ratings_count: newCount
            }).eq('id', creatorId);
        }

        fetchCreators();
  }, [creators, fetchCreators]);

  const getCreatorById = useCallback((creatorId: string) => {
    return creators.find(c => c.id === creatorId);
  }, [creators]);

  const upgradeToPro = useCallback(async (creatorId: string) => {
        const { error } = await supabase.from('profiles').update({ is_pro: true }).eq('id', creatorId);
        if(!error) fetchCreators();
  }, [fetchCreators]);

  const updateAvailability = useCallback(async (creatorId: string, availability: string) => {
        const { error } = await supabase.from('profiles').update({ availability }).eq('id', creatorId);
        if(!error) fetchCreators();
  }, [fetchCreators]);

  return (
    <CreatorsContext.Provider value={{ creators, loading, addCreator, updateCreatorProfile, addRating, getCreatorById, upgradeToPro, updateAvailability }}>
      {children}
    </CreatorsContext.Provider>
  );
};
