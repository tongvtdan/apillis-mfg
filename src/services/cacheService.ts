import { Project } from '@/types/project';

const CACHE_KEY = 'apillis_projects_cache';
const CACHE_TIMESTAMP_KEY = 'apillis_projects_cache_timestamp';
const CACHE_DURATION = 15 * 60 * 1000; // Increased from 5 to 15 minutes for better stability

export interface CacheService {
    setProjects: (projects: Project[]) => void;
    getProjects: () => Project[] | null;
    isCacheValid: () => boolean;
    clearCache: () => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    updateProjectStatus: (projectId: string, newStatus: string) => void;
    getProject: (projectId: string) => Project | null;
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
    },

    updateProject: (projectId: string, updates: Partial<Project>) => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) return;

            const projects = JSON.parse(cachedData) as Project[];
            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, ...updates, updated_at: new Date().toISOString() }
                    : project
            );

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProjects));
        } catch (error) {
            console.warn('Failed to update cached project:', error);
        }
    },

    updateProjectStatus: (projectId: string, newStatus: string) => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) return;

            const projects = JSON.parse(cachedData) as Project[];
            const updatedProjects = projects.map(project =>
                project.id === projectId
                    ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                    : project
            );

            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProjects));
        } catch (error) {
            console.warn('Failed to update cached project status:', error);
        }
    },

    getProject: (projectId: string): Project | null => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) return null;

            const projects = JSON.parse(cachedData) as Project[];
            return projects.find(project => project.id === projectId) || null;
        } catch (error) {
            console.warn('Failed to retrieve cached project:', error);
            return null;
        }
    }
};