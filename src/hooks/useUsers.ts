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
        if (userIds.length === 0) {
            setUsers(new Map());
            return;
        }

        setLoading(true);
        userService.getUsersByIds(userIds)
            .then(setUsers)
            .catch(error => {
                console.error('Error fetching users:', error);
                setUsers(new Map());
            })
            .finally(() => setLoading(false));
    }, [userIds.join(',')]); // Join to create stable dependency

    return { users, loading };
}

export function useUserDisplayName(userId: string | null | undefined): string {
    const { user } = useUser(userId);
    return user?.display_name || userId || 'Unknown User';
}