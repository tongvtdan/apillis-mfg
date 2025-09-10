import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/core/auth';

export interface UserLookup {
    id: string;
    display_name: string;
    role: string;
    department?: string;
}

class UserService {
    private userCache = new Map<string, UserLookup>();

    async getUserById(userId: string): Promise<UserLookup | null> {
        // Check cache first
        if (this.userCache.has(userId)) {
            return this.userCache.get(userId)!;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, role, department')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user:', error);
                return null;
            }

            if (data) {
                const userLookup: UserLookup = {
                    id: data.id,
                    display_name: data.name,
                    role: data.role,
                    department: data.department
                };

                // Cache the result
                this.userCache.set(userId, userLookup);
                return userLookup;
            }

            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async getUsersByIds(userIds: string[]): Promise<Map<string, UserLookup>> {
        const result = new Map<string, UserLookup>();
        const uncachedIds: string[] = [];

        // Check cache first
        for (const userId of userIds) {
            if (this.userCache.has(userId)) {
                result.set(userId, this.userCache.get(userId)!);
            } else {
                uncachedIds.push(userId);
            }
        }

        // Fetch uncached users
        if (uncachedIds.length > 0) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, role, department')
                    .in('id', uncachedIds);

                if (error) {
                    console.error('Error fetching users:', error);
                    return result;
                }

                if (data) {
                    for (const user of data) {
                        const userLookup: UserLookup = {
                            id: user.id,
                            display_name: user.name,
                            role: user.role,
                            department: user.department
                        };

                        // Cache and add to result
                        this.userCache.set(user.id, userLookup);
                        result.set(user.id, userLookup);
                    }
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }

        return result;
    }

    clearCache() {
        this.userCache.clear();
    }

    clearUserCache(userId: string) {
        this.userCache.delete(userId);
    }
}

export const userService = new UserService();