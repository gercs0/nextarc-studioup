
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Creator, User, Review } from '../types';

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
  const [creators, setCreators] = useState<Creator[]>(() => {
      try {
          const localData = localStorage.getItem('creators');
          if (localData) {
              return JSON.parse(localData);
          }
      } catch (error) {
          console.error("Could not parse creators from localStorage", error);
      }
      // Start with an empty list for a real production feel
      return [];
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('creators', JSON.stringify(creators));
  }, [creators]);

  const addCreator = useCallback(async (user: User) => {
        const existingCreator = creators.find(c => c.id === user.id);
        if (existingCreator) return;

        const newCreator: Creator = {
            id: user.id,
            username: user.name,
            bio: 'Welcome to my profile! I am a content creator passionate about sports.',
            profilePictureUrl: `https://i.pravatar.cc/150?u=${user.id}`,
            rating: 0,
            ratingsCount: 0,
            reviews: [],
            portfolio: [],
            isPro: false,
            availability: 'Available',
        };
        setCreators(prev => [...prev, newCreator]);
  }, [creators]);

  const updateCreatorProfile = useCallback(async (creatorId: string, profileData: Partial<Pick<Creator, 'username' | 'bio' | 'profilePictureUrl'>>) => {
        setCreators(prev => prev.map(creator =>
            creator.id === creatorId ? { ...creator, ...profileData } : creator
        ));
  }, []);

  const addRating = useCallback(async (creatorId: string, reviewData: Omit<Review, 'id' | 'timestamp'>) => {
        const newReview: Review = {
          ...reviewData,
          id: `rev_${Date.now()}`,
          timestamp: Date.now(),
        };
        
        setCreators(prev => prev.map(creator => {
          if (creator.id === creatorId) {
            const newRatingsCount = creator.ratingsCount + 1;
            const newTotalRating = (creator.rating * creator.ratingsCount) + newReview.rating;
            const newAverageRating = parseFloat((newTotalRating / newRatingsCount).toFixed(2));
            return {
              ...creator,
              rating: newAverageRating,
              ratingsCount: newRatingsCount,
              reviews: [newReview, ...creator.reviews],
            };
          }
          return creator;
        }));
  }, []);

  const getCreatorById = useCallback((creatorId: string) => {
    return creators.find(c => c.id === creatorId);
  }, [creators]);

  const upgradeToPro = useCallback(async (creatorId: string) => {
        setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, isPro: true } : c));
  }, []);

  const updateAvailability = useCallback(async (creatorId: string, availability: string) => {
        setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, availability } : c));
  }, []);

  return (
    <CreatorsContext.Provider value={{ creators, loading, addCreator, updateCreatorProfile, addRating, getCreatorById, upgradeToPro, updateAvailability }}>
      {children}
    </CreatorsContext.Provider>
  );
};
