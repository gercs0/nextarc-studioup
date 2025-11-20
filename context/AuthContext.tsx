
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import { User, UserRole } from '../types';
import { GOOGLE_CLIENT_ID } from '../constants';
import { sendEmail } from '../services/emailService';
import { parseJwt } from '../lib/utils';

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

const USERS_STORAGE_KEY = 'nextarc_users';
const SESSION_STORAGE_KEY = 'nextarc_session';

const getUsersFromStorage = (): User[] => {
    try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
        // Start with an empty list for a real production feel
        return [];
    } catch (error) {
        console.error("Failed to initialize users", error);
        return [];
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize currentUser synchronously from localStorage to prevent auth flash
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      try {
          const session = localStorage.getItem(SESSION_STORAGE_KEY);
          return session ? JSON.parse(session) : null;
      } catch {
          return null;
      }
  });
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(getUsersFromStorage);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Sync current user with users list in case of updates
  useEffect(() => {
      if (currentUser) {
          const freshUser = users.find(u => u.id === currentUser.id);
          if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
              setCurrentUser(freshUser);
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(freshUser));
          }
      }
  }, [users, currentUser]);

  const login = useCallback(async (email: string, password?: string, role?: UserRole): Promise<User> => {
    // No simulation delays - real synchronous check against local DB
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        throw new Error("User not found.");
    }
    
    if (user.password !== password) {
        throw new Error("Invalid password.");
    }
    
    if (role && user.role !== role) {
        throw new Error(`Account exists but is registered as a ${user.role}, not ${role}.`);
    }

    setCurrentUser(user);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  }, [users]);

  const signup = useCallback(async (name: string, email: string, role: UserRole, password?: string): Promise<User> => {
    // No simulation delays
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
    }
    const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role,
        password,
        verified: role === 'athlete', // Athletes are auto-verified, creators need manual verification
        isVerified: role === 'athlete', // for athlete verification badge
        twoFactorEnabled: false,
        savedProjects: [],
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    sendEmail(newUser.email, "Welcome to NextArc Studio!", `Hi ${newUser.name},\n\nWelcome! Your account has been created.`);
    if (role === 'creator') {
      sendEmail('admin@nextarc.io', 'New Creator Signup', `A new creator, ${newUser.name} (${newUser.email}), has signed up and is awaiting verification.`);
    }
    return newUser;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const loginWithGoogle = useCallback(async (credentialResponse: any): Promise<User> => {
    if (!credentialResponse.credential) {
        throw new Error("Google authentication failed.");
    }

    const payload = parseJwt(credentialResponse.credential);
    if (!payload) {
        throw new Error("Invalid Google token.");
    }

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user exists
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        // Create new user from Google data
        user = {
            id: `user_google_${Date.now()}`,
            name: name,
            email: email,
            role: 'athlete', // Default to athlete for Google Login
            verified: true,
            isVerified: true,
            twoFactorEnabled: false,
            savedProjects: [],
            password: 'google-auth-linked',
        };
        setUsers(prev => [...prev, user!]);
    }

    setCurrentUser(user);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  }, [users]);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    return users;
  }, [users]);

  const verifyCreator = useCallback(async (userId: string): Promise<void> => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
  }, []);
  
  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);
  
  const verifyAthlete = useCallback(async (userId: string): Promise<void> => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
  }, []);

  const saveProject = useCallback(async (projectId: string): Promise<void> => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, savedProjects: [...(currentUser.savedProjects || []), projectId] };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [currentUser]);

  const unsaveProject = useCallback(async (projectId: string): Promise<void> => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, savedProjects: (currentUser.savedProjects || []).filter(id => id !== projectId) };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [currentUser]);
  
  const toggle2FA = useCallback(async (enabled: boolean): Promise<void> => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, twoFactorEnabled: enabled };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [currentUser]);


  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, loginWithGoogle, getAllUsers, verifyCreator, getUserById, verifyAthlete, saveProject, unsaveProject, toggle2FA }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
