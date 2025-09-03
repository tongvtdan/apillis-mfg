import { useUserDisplayName } from './useUsers';
import { userService } from '@/services/userService';

export function useOwnerDisplayName(ownerId: string | null | undefined): string {
    // Use the same approach as the project list - simple and direct
    const displayName = useUserDisplayName(ownerId);

    // Return the display name, which will be the actual name if found, or the ID if not found
    return displayName || 'Unknown Owner';
}

// Clear the user cache once to force re-fetching after RLS fix
// This will help if the cache contains old UUID results
if (typeof window !== 'undefined') {
    // Only run this once when the module is loaded
    userService.clearCache();
}
