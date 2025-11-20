
import { Counters } from '../types';
import { INITIAL_FOLLOWER_COUNT } from '../constants';

const COUNTERS_KEY = 'globalCounters';

const initialCounters: Counters = {
  followers: INITIAL_FOLLOWER_COUNT,
  athletes: 450,
  projects: 120,
  completed: 85,
};

const getBaseCounters = async (): Promise<Counters> => {
  try {
    const storedCounters = localStorage.getItem(COUNTERS_KEY);
    if (storedCounters) {
      return JSON.parse(storedCounters);
    } else {
      localStorage.setItem(COUNTERS_KEY, JSON.stringify(initialCounters));
      return initialCounters;
    }
  } catch (error) {
    console.error("Failed to get base counters", error);
    return initialCounters;
  }
};

export const getLiveCounters = async (): Promise<Counters> => {
    const baseCounters = await getBaseCounters();
    // Simulate live Instagram follower count fluctuation
    const followerFluctuation = Math.floor(Math.random() * 4) - 1; // -1, 0, 1, 2
    
    // In a real application, this would be an API call. Here we simulate.
    const liveFollowers = baseCounters.followers + followerFluctuation;
    
    return {
        ...baseCounters,
        followers: Math.max(INITIAL_FOLLOWER_COUNT, liveFollowers), // Don't let it go below initial
    };
};

export const incrementCounter = async (key: keyof Counters, amount = 1): Promise<Counters> => {
  const currentCounters = await getBaseCounters();
  const newCounters = { ...currentCounters, [key]: currentCounters[key] + amount };
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(newCounters));
  return newCounters;
};

export const resetCounters = () => {
    localStorage.setItem(COUNTERS_KEY, JSON.stringify(initialCounters));
};
