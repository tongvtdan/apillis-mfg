import { Project } from '@/types/project';

const CACHE_KEY = 'apillis_projects_cache';
const CACHE_TIMESTAMP_KEY = 'apillis_projects_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

export interface CacheService {
  setProjects: (projects: Project[]) => void;
  getProjects: () => Project[] | null;
  isCacheValid: () => boolean;
  clearCache: () => void;
}

export const cacheService: CacheService = {
  setProjects: (projects: Project[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache projects:', error);
    }
  },

  getProjects: (): Project[] | null => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;
      
      const projects = JSON.parse(cachedData) as Project[];
      return projects;
    } catch (error) {
      console.warn('Failed to retrieve cached projects:', error);
      return null;
    }
  },

  isCacheValid: (): boolean => {
    try {
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;
      
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      return (now - cacheTime) < CACHE_DURATION;
    } catch (error) {
      console.warn('Failed to check cache validity:', error);
      return false;
    }
  },

  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
};