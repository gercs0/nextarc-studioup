import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import { User, UserRole } from '../types';
import { MOCK_CREATORS } from '../constants';
import { sendEmail } from '../services/emailService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<User>;
  signup: (name: string, email: string, role: UserRole, password?: string) => Promise<User>;
  logout: () => void;
  loginWithGoogle: () => Promise<User>;
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
        // Initialize with mock creators as users so they can log in
        const initialUsers: User[] = MOCK_CREATORS.map(creator => ({
            id: creator.id,
            name: creator.username,
            email: `${creator.username.toLowerCase()}@nextarc.io`,
            password: 'password123', // Dummy password
            role: 'creator',
            verified: true, // Mock users are pre-verified
            isVerified: true,
            twoFactorEnabled: false,
            savedProjects: [],
        }));
        // Add a default athlete
        initialUsers.push({
            id: 'athlete-abc',
            name: 'Alex Athlete',
            email: 'athlete@nextarc.io',
            password: 'password123',
            role: 'athlete',
            verified: true,
            isVerified: false, // Start as unverified
            twoFactorEnabled: false,
            savedProjects: [],
        });

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    } catch (error) {
        console.error("Failed to initialize users", error);
        return [];
    }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(getUsersFromStorage);

  useEffect(() => {
    if (users.length > 0) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        const loggedInUser = JSON.parse(session);
        // Make sure the user from session still exists in our user list
        if (users.some(u => u.id === loggedInUser.id)) {
            setCurrentUser(loggedInUser);
        } else {
             localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load session", error);
    } finally {
      setLoading(false);
    }
  }, [users]);

  const login = useCallback(async (email: string, password?: string, role?: UserRole): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
        if (user && user.password === password) {
          setCurrentUser(user);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid credentials or role mismatch."));
        }
      }, 500);
    });
  }, [users]);

  const signup = useCallback(async (name: string, email: string, role: UserRole, password?: string): Promise<User> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                  return reject(new Error("An account with this email already exists."));
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
              resolve(newUser);
          }, 500);
      });
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    // This is a simulation. In a real app, this would involve OAuth flow.
    // We'll log in the mock athlete user.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockAthlete = users.find(u => u.email === 'athlete@nextarc.io');
        if (mockAthlete) {
          setCurrentUser(mockAthlete);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mockAthlete));
          resolve(mockAthlete);
        } else {
          reject(new Error("Mock user for Google Sign-In not found."));
        }
      }, 500);
    });
  }, [users]);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    return Promise.resolve(users);
  }, [users]);

  const verifyCreator = useCallback(async (userId: string): Promise<void> => {
      return new Promise(resolve => {
        setTimeout(() => {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
            resolve();
        }, 300);
      });
  }, []);
  
  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);
  
  const verifyAthlete = useCallback(async (userId: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
            resolve();
        }, 300);
    });
  }, []);

  const saveProject = useCallback(async (projectId: string): Promise<void> => {
    if (!currentUser) return;
    return new Promise(resolve => {
        setTimeout(() => {
            const updatedUser = { ...currentUser, savedProjects: [...(currentUser.savedProjects || []), projectId] };
            setCurrentUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
            resolve();
        }, 300);
    });
  }, [currentUser]);

  const unsaveProject = useCallback(async (projectId: string): Promise<void> => {
    if (!currentUser) return;
    return new Promise(resolve => {
        setTimeout(() => {
            const updatedUser = { ...currentUser, savedProjects: (currentUser.savedProjects || []).filter(id => id !== projectId) };
            setCurrentUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
            resolve();
        }, 300);
    });
  }, [currentUser]);
  
  const toggle2FA = useCallback(async (enabled: boolean): Promise<void> => {
    if (!currentUser) return;
    return new Promise(resolve => {
        setTimeout(() => {
            const updatedUser = { ...currentUser, twoFactorEnabled: enabled };
            setCurrentUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
             localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
            resolve();
        }, 300);
    });
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