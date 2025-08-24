import { Project } from '@/types/project';
// Mock project data removed - using database only

// Environment flag to control data source
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK_DATA === 'true';

// Connection timeout for Supabase calls
const CONNECTION_TIMEOUT = 5000; // 5 seconds

interface ProjectServiceOptions {
    forceMock?: boolean;
    timeout?: number;
}

class ProjectService {
    private useMockData: boolean;
    private connectionTimeout: number;

    constructor() {
        this.useMockData = USE_MOCK_DATA;
        this.connectionTimeout = CONNECTION_TIMEOUT;
    }

    // Set whether to use mock data
    setUseMockData(useMock: boolean) {
        this.useMockData = useMock;
        console.log(`🔄 ProjectService: Switched to ${useMock ? 'MOCK' : 'SUPABASE'} data mode`);
    }

    // Get project by ID with fallback
    async getProjectById(id: string, options: ProjectServiceOptions = {}): Promise<Project> {
        const { forceMock = false, timeout = this.connectionTimeout } = options;

        console.log(`🔍 ProjectService: Fetching project ${id} (mode: ${forceMock || this.useMockData ? 'MOCK' : 'SUPABASE'})`);

        // If forced to use mock data or in mock mode
        if (forceMock || this.useMockData) {
            return this.getMockProject(id);
        }

        // Try Supabase first with timeout
        try {
            const supabaseProject = await this.getSupabaseProjectWithTimeout(id, timeout);
            console.log('✅ ProjectService: Successfully fetched from Supabase');
            return supabaseProject;
        } catch (error) {
            console.warn('⚠️ ProjectService: Supabase failed, falling back to mock data:', error);
            return this.getMockProject(id);
        }
    }

    // Get all projects with fallback
    async getAllProjects(options: ProjectServiceOptions = {}): Promise<Project[]> {
        const { forceMock = false, timeout = this.connectionTimeout } = options;

        console.log(`📊 ProjectService: Fetching all projects (mode: ${forceMock || this.useMockData ? 'MOCK' : 'SUPABASE'})`);

        // If forced to use mock data or in mock mode
        if (forceMock || this.useMockData) {
            return [];
        }

        // Try Supabase first with timeout
        try {
            const supabaseProjects = await this.getSupabaseProjectsWithTimeout(timeout);
            console.log(`✅ ProjectService: Successfully fetched ${supabaseProjects.length} projects from Supabase`);
            return supabaseProjects;
        } catch (error) {
            console.warn('⚠️ ProjectService: Supabase failed, falling back to empty array:', error);
            return [];
        }
    }

    // Test connection to Supabase
    async testConnection(): Promise<{ success: boolean; error?: string; source: 'supabase' | 'mock' }> {
        if (this.useMockData) {
            return { success: true, source: 'mock' };
        }

        try {
            await this.getSupabaseProjectsWithTimeout(3000); // Quick test
            return { success: true, source: 'supabase' };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                source: 'mock'
            };
        }
    }

    // Private method to get mock project
    private getMockProject(id: string): Project {
        throw new Error(`Mock project with ID "${id}" not found - mock data not available`);
    }

    // Private method to get Supabase project with timeout
    private async getSupabaseProjectWithTimeout(id: string, timeout: number): Promise<Project> {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Supabase connection timeout after ${timeout}ms`));
            }, timeout);

            try {
                // Dynamic import to avoid issues if Supabase is not available
                const { supabase } = await import('@/integrations/supabase/client');

                const { data, error } = await supabase
                    .from('projects')
                    .select(`
            *,
            customer:customers(*)
          `)
                    .eq('id', id)
                    .single();

                clearTimeout(timeoutId);

                if (error) {
                    throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
                }

                if (!data) {
                    throw new Error(`Project with ID "${id}" not found in Supabase`);
                }

                // Map legacy status to new status if needed
                const mappedProject = {
                    ...data,
                    status: this.mapLegacyStatusToNew(data.status)
                };

                resolve(mappedProject);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    // Private method to get all Supabase projects with timeout
    private async getSupabaseProjectsWithTimeout(timeout: number): Promise<Project[]> {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Supabase connection timeout after ${timeout}ms`));
            }, timeout);

            try {
                // Dynamic import to avoid issues if Supabase is not available
                const { supabase } = await import('@/integrations/supabase/client');

                const { data, error } = await supabase
                    .from('projects')
                    .select(`
            *,
            customer:customers(*)
          `)
                    .order('created_at', { ascending: false });

                clearTimeout(timeoutId);

                if (error) {
                    throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
                }

                // Map legacy status to new status if needed
                const mappedProjects = (data || []).map(project => ({
                    ...project,
                    status: this.mapLegacyStatusToNew(project.status)
                }));

                resolve(mappedProjects);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    // Helper function to map legacy status to new status
    private mapLegacyStatusToNew(legacyStatus: string): any {
        const LEGACY_TO_NEW_STATUS: Record<string, string> = {
            'inquiry': 'inquiry_received',
            'review': 'technical_review',
            'quoted': 'quoted',
            'won': 'order_confirmed',
            'lost': 'shipped_closed',
            'production': 'in_production',
            'completed': 'shipped_closed',
            'cancelled': 'shipped_closed'
        };

        return LEGACY_TO_NEW_STATUS[legacyStatus] || legacyStatus;
    }
}

// Export singleton instance
export const projectService = new ProjectService();

// Export class for testing
export { ProjectService };