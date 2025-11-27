
import { Counters } from '../types';
import { supabase } from '../lib/supabase';
import { INITIAL_FOLLOWER_COUNT } from '../constants';

const COUNTERS_KEY = 'globalCounters';

// Keep followers simulated in local storage as "Community Size"
const getStoredFollowers = (): number => {
    try {
        const stored = localStorage.getItem(COUNTERS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.followers || INITIAL_FOLLOWER_COUNT;
        }
    } catch(e) {}
    return INITIAL_FOLLOWER_COUNT;
};

export const getLiveCounters = async (): Promise<Counters> => {
    try {
        // 1. Athletes Count
        const { count: athleteCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'athlete');

        // 2. Projects Count (Total)
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        // 3. Completed Projects
        const { count: completedCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');
            
        const followers = getStoredFollowers();

        return {
            followers,
            athletes: athleteCount || 0,
            projects: projectCount || 0,
            completed: completedCount || 0
        };
    } catch (error) {
        console.error("Error fetching live counters:", error);
        return {
            followers: getStoredFollowers(),
            athletes: 0,
            projects: 0,
            completed: 0
        };
    }
};

export const incrementCounter = async (key: keyof Counters, amount = 1): Promise<Counters> => {
  // We only manually increment 'followers' now, as others are derived from DB.
  if (key === 'followers') {
      const current = getStoredFollowers();
      const newVal = current + amount;
      const stored = localStorage.getItem(COUNTERS_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      
      const newCounters = { ...parsed, followers: newVal };
      localStorage.setItem(COUNTERS_KEY, JSON.stringify(newCounters));
      
      // Return a hybrid object for the caller
      return getLiveCounters();
  }
  
  // For other keys, we just return the live DB state
  return getLiveCounters();
};

export const resetCounters = () => {
    localStorage.removeItem(COUNTERS_KEY);
};
