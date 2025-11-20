
import { Counters } from '../types';
import { INITIAL_FOLLOWER_COUNT } from '../constants';

const COUNTERS_KEY = 'globalCounters';
const USERS_KEY = 'nextarc_users';
const PROJECTS_KEY = 'projects';

const initialCounters: Counters = {
  followers: INITIAL_FOLLOWER_COUNT,
  athletes: 0,
  projects: 0,
  completed: 0,
};

const getRealCounts = (): Partial<Counters> => {
    try {
        const storedUsers = localStorage.getItem(USERS_KEY);
        const storedProjects = localStorage.getItem(PROJECTS_KEY);
        
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        const projects = storedProjects ? JSON.parse(storedProjects) : [];

        const athleteCount = Array.isArray(users) ? users.filter((u: any) => u.role === 'athlete').length : 0;
        const projectCount = Array.isArray(projects) ? projects.length : 0;
        const completedCount = Array.isArray(projects) ? projects.filter((p: any) => p.status === 'completed').length : 0;

        return {
            athletes: athleteCount,
            projects: projectCount,
            completed: completedCount
        };
    } catch (e) {
        return { athletes: 0, projects: 0, completed: 0 };
    }
}

const getBaseCounters = async (): Promise<Counters> => {
  try {
    const storedCounters = localStorage.getItem(COUNTERS_KEY);
    const realCounts = getRealCounts();

    if (storedCounters) {
      const parsed = JSON.parse(storedCounters);
      // Merge stored counters (like followers) with real-time database counts
      return { ...parsed, ...realCounts };
    } else {
      const newCounters = { ...initialCounters, ...realCounts };
      localStorage.setItem(COUNTERS_KEY, JSON.stringify(newCounters));
      return newCounters;
    }
  } catch (error) {
    console.error("Failed to get base counters", error);
    return initialCounters;
  }
};

export const getLiveCounters = async (): Promise<Counters> => {
    const baseCounters = await getBaseCounters();
    // Just return the real base counters without fake fluctuation
    return baseCounters;
};

export const incrementCounter = async (key: keyof Counters, amount = 1): Promise<Counters> => {
  const currentCounters = await getBaseCounters();
  const newCounters = { ...currentCounters, [key]: currentCounters[key] + amount };
  
  // We only store the 'followers' count manually, others are derived from DB length in getBaseCounters
  // But for simplicity in this mock service, we update the object.
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(newCounters));
  return newCounters;
};

export const resetCounters = () => {
    localStorage.setItem(COUNTERS_KEY, JSON.stringify(initialCounters));
};
