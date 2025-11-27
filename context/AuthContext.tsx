

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { sendEmail } from '../services/emailService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<User>;
  signup: (name: string, email: string, role: UserRole, password?: string) => Promise<User>;
  logout: () => void;
  loginWithGoogle: (credentialResponse: any) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  verifyCreator: (userId: string) => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  verifyAthlete: (userId: string) => Promise<void>;
  saveProject: (projectId: string) => Promise<void>;
  unsaveProject: (projectId: string) => Promise<void>;
  toggle2FA: (enabled: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsersCache, setAllUsersCache] = useState<User[]>([]); // Cache for getAllUsers

  // Fetch user profile from 'profiles' table
  const fetchProfile = async (userId: string, email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
          // It's possible the auth user exists but profile trigger hasn't run or failed
          // For now, return null and let the calling function handle it
          return null;
      }

      return {
        id: data.id,
        email: email,
        name: data.name,
        role: data.role as UserRole,
        verified: data.verified,
        isVerified: data.is_verified,
        twoFactorEnabled: false, 
        savedProjects: data.saved_projects || [],
        isAdmin: data.is_admin || false,
        isPro: data.is_pro || false,
        stripeAccountId: data.stripe_account_id
      };
    } catch (err) {
      console.error("Profile fetch error", err);
      return null;
    }
  };

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = await fetchProfile(session.user.id, session.user.email!);
        setCurrentUser(user);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Add a small delay to allow for profile creation/updates if this is a new signup
        setTimeout(async () => {
            const user = await fetchProfile(session.user.id, session.user.email!);
            setCurrentUser(user);
        }, 500);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password?: string, role?: UserRole): Promise<User> => {
    if (!password) throw new Error("Password required");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Login failed");

    // Check profile role
    const profile = await fetchProfile(data.user.id, data.user.email!);
    if (profile && role && profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`This account is registered as a ${profile.role}, not ${role}.`);
    }

    return profile!;
  }, []);

  const signup = useCallback(async (name: string, email: string, role: UserRole, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");

    // 1. Sign up in Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role } // Meta data for Supabase Auth
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Signup failed");

    // 2. Create Profile Entry manually
    // Note: In a production Supabase app, you often use a Database Trigger on auth.users to create this.
    // Here we do it client-side for the MVP.
    
    const dbProfilePayload = {
        id: data.user.id,
        name: name,
        email: email,
        role: role,
        verified: role === 'athlete', // Athletes auto-verified for MVP
        is_verified: role === 'athlete',
        saved_projects: [],
        is_admin: false,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([dbProfilePayload]);

    if (profileError) {
      console.error("Error creating profile row:", profileError);
    }

    const user: User = { 
        id: data.user.id,
        email,
        name,
        role,
        verified: dbProfilePayload.verified,
        isVerified: dbProfilePayload.is_verified,
        savedProjects: [],
        isAdmin: false,
        isPro: false
    };
    
    setCurrentUser(user);

    sendEmail(email, "Welcome to NextArc Studio!", `Hi ${name},\n\nWelcome! Your account has been created.`);
    
    return user;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const loginWithGoogle = useCallback(async (credentialResponse: any): Promise<User> => {
      // Note: Supabase Google Login typically requires a redirect flow or signInWithIdToken if configured.
      // Since we are using a specific anon key, we assume Supabase Auth is configured.
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error || !data.user) throw new Error("Google Login failed with Supabase.");
      
      let profile = await fetchProfile(data.user.id, data.user.email!);
      
      if (!profile) {
           // First time login, create profile
           const dbProfilePayload = {
              id: data.user.id,
              name: data.user.user_metadata.full_name || 'Google User',
              email: data.user.email,
              role: 'athlete', // Default to athlete for Google Signups
              verified: true,
              is_verified: true,
              saved_projects: [],
              is_admin: false
            };
            
            await supabase.from('profiles').insert([dbProfilePayload]);
            
            profile = {
                id: dbProfilePayload.id,
                name: dbProfilePayload.name as string,
                email: data.user.email!,
                role: 'athlete',
                verified: true,
                isVerified: true,
                savedProjects: [],
                isAdmin: false,
                isPro: false
            };
      }
      
      return profile;
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    
    const mapped: User[] = data.map((p: any) => ({
        id: p.id,
        email: p.email,
        name: p.name,
        role: p.role,
        verified: p.verified,
        isVerified: p.is_verified,
        savedProjects: p.saved_projects || [],
        isAdmin: p.is_admin,
        isPro: p.is_pro
    }));
    setAllUsersCache(mapped);
    return mapped;
  }, []);

  const verifyCreator = useCallback(async (userId: string): Promise<void> => {
    await supabase.from('profiles').update({ verified: true }).eq('id', userId);
    // Update local state if necessary
    setAllUsersCache(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
  }, []);
  
  const getUserById = useCallback((userId: string) => {
      return allUsersCache.find(u => u.id === userId); 
  }, [allUsersCache]);
  
  const verifyAthlete = useCallback(async (userId: string): Promise<void> => {
     await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
  }, []);

  const saveProject = useCallback(async (projectId: string): Promise<void> => {
    if (!currentUser) return;
    const newSaved = [...(currentUser.savedProjects || []), projectId];
    
    const { error } = await supabase
        .from('profiles')
        .update({ saved_projects: newSaved })
        .eq('id', currentUser.id);

    if (!error) {
        setCurrentUser(prev => prev ? { ...prev, savedProjects: newSaved } : null);
    }
  }, [currentUser]);

  const unsaveProject = useCallback(async (projectId: string): Promise<void> => {
    if (!currentUser) return;
    const newSaved = (currentUser.savedProjects || []).filter(id => id !== projectId);

    const { error } = await supabase
        .from('profiles')
        .update({ saved_projects: newSaved })
        .eq('id', currentUser.id);

    if (!error) {
        setCurrentUser(prev => prev ? { ...prev, savedProjects: newSaved } : null);
    }
  }, [currentUser]);
  
  const toggle2FA = useCallback(async (enabled: boolean): Promise<void> => {
      if (!currentUser) return;
      // Supabase MFA requires specific API calls. For MVP, we simulate state update.
      setCurrentUser(prev => prev ? { ...prev, twoFactorEnabled: enabled } : null);
  }, [currentUser]);


  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, loginWithGoogle, getAllUsers, verifyCreator, getUserById, verifyAthlete, saveProject, unsaveProject, toggle2FA }}>
      {children}
    </AuthContext.Provider>
  );
};