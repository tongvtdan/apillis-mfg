import { Project } from '@/types/project';
// Mock project data removed - using database only

// Environment flag to control data source - force Supabase mode
const USE_MOCK_DATA = false;

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

        console.log(`🔍 ProjectService: Fetching project ${id} (mode: ${forceMock ? 'MOCK' : 'SUPABASE'})`);

        // If forced to use mock data, return error since mock data is not available
        if (forceMock) {
            throw new Error(`Mock data is not available. Please use Supabase mode.`);
        }

        // Try Supabase with timeout
        try {
            const supabaseProject = await this.getSupabaseProjectWithTimeout(id, timeout);
            console.log('✅ ProjectService: Successfully fetched from Supabase');
            return supabaseProject;
        } catch (error) {
            console.error('❌ ProjectService: Failed to fetch project from Supabase:', error);
            throw new Error(`Project with ID "${id}" not found`);
        }
    }

    // Get all projects with fallback
    async getAllProjects(options: ProjectServiceOptions = {}): Promise<Project[]> {
        const { forceMock = false, timeout = this.connectionTimeout } = options;

        console.log(`📊 ProjectService: Fetching all projects (mode: ${forceMock ? 'MOCK' : 'SUPABASE'})`);

        // If forced to use mock data, return empty array since mock data is not available
        if (forceMock) {
            console.warn('⚠️ ProjectService: Mock data requested but not available, returning empty array');
            return [];
        }

        // Try Supabase with timeout
        try {
            const supabaseProjects = await this.getSupabaseProjectsWithTimeout(timeout);
            console.log(`✅ ProjectService: Successfully fetched ${supabaseProjects.length} projects from Supabase`);
            return supabaseProjects;
        } catch (error) {
            console.warn('⚠️ ProjectService: Supabase failed, returning empty array:', error);
            return [];
        }
    }

    // Test connection to Supabase
    async testConnection(): Promise<{ success: boolean; error?: string; source: 'supabase' | 'mock' }> {
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data, error } = await supabase
                .from('projects')
                .select('id')
                .limit(1);

            if (error) throw error;

            console.log('✅ ProjectService: Supabase connection test successful');
            return { success: true, source: 'supabase' };
        } catch (error: any) {
            console.warn('⚠️ ProjectService: Supabase connection test failed:', error);
            return {
                success: false,
                error: error?.message || 'Unknown error',
                source: 'supabase'
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
                const originalStatus = data.status;
                const mappedStatus = this.mapLegacyStatusToNew(data.status);

                if (originalStatus !== mappedStatus) {
                    console.log(`🔄 ProjectService: Status mapped from "${originalStatus}" to "${mappedStatus}"`);
                }

                const mappedProject = {
                    ...data,
                    status: mappedStatus
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
                const mappedProjects = (data || []).map(project => {
                    const originalStatus = project.status;
                    const mappedStatus = this.mapLegacyStatusToNew(project.status);

                    if (originalStatus !== mappedStatus) {
                        console.log(`🔄 ProjectService: Project ${project.id} status mapped from "${originalStatus}" to "${mappedStatus}"`);
                    }

                    return {
                        ...project,
                        status: mappedStatus
                    };
                });

                resolve(mappedProjects);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    // Helper function to map legacy status to new status
    private mapLegacyStatusToNew(legacyStatus: string): any {
        // Use the same mapping as useProjects hook for consistency
        const LEGACY_TO_NEW_STATUS: Record<string, string> = {
            'inquiry': 'inquiry_received',
            'review': 'technical_review',
            'supplier_rfq': 'supplier_rfq_sent',
            'quoted': 'quoted',
            'won': 'order_confirmed',
            'procurement': 'procurement_planning',
            'production': 'in_production',
            'completed': 'shipped_closed',
            'lost': 'shipped_closed',
            'cancelled': 'shipped_closed'
        };

        return LEGACY_TO_NEW_STATUS[legacyStatus] || legacyStatus;
    }
}

// Export singleton instance
export const projectService = new ProjectService();

// Export class for testing
export { ProjectService };