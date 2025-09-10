import { useState, useEffect } from 'react';
import { userService, UserLookup } from '@/services/userService';

export function useUser(userId: string | null | undefined) {
    const [user, setUser] = useState<UserLookup | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            setUser(null);
            return;
        }

        setLoading(true);
        userService.getUserById(userId)
            .then(setUser)
            .catch(error => {
                console.error('Error fetching user:', error);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    return { user, loading };
}

export function useUsers(userIds: string[]) {
    const [users, setUsers] = useState<Map<string, UserLookup>>(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userIds.length) {
            setUsers(new Map());
            return;
        }

        setLoading(true);
        userService.getUsersByIds(userIds)
            .then(userMap => setUsers(userMap))
            .catch(error => {
                console.error('Error fetching users:', error);
                setUsers(new Map());
            })
            .finally(() => setLoading(false));
    }, [userIds]);

    return { users, loading };
}

export function useUserDisplayName(userId: string | null | undefined): string {
    const { user, loading } = useUser(userId);

    if (loading) return 'Loading...';
    if (!user) return userId || 'Unknown User';

    return user.name || user.email || userId || 'Unknown User';
}
