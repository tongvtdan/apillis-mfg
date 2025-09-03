import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserDisplayName } from './useUsers';

export function useOwnerDisplayName(ownerId: string | null | undefined): string {
    const [ownerName, setOwnerName] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // First try to get user display name
    const userDisplayName = useUserDisplayName(ownerId);

    useEffect(() => {
        if (!ownerId) {
            setOwnerName('Unknown Owner');
            return;
        }

        // If user display name is not the UUID (meaning we found a user), use it
        if (userDisplayName !== ownerId && userDisplayName !== 'Unknown User') {
            setOwnerName(userDisplayName);
            return;
        }

        // If user lookup failed, try to find a contact
        const lookupContact = async () => {
            setLoading(true);
            try {
                const { data: contact, error } = await supabase
                    .from('contacts')
                    .select('contact_name, company_name')
                    .eq('id', ownerId)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching contact:', error);
                    setOwnerName('Unknown Owner');
                    return;
                }

                if (contact) {
                    // Prefer contact_name, fallback to company_name
                    const name = contact.contact_name || contact.company_name || 'Unknown Contact';
                    setOwnerName(name);
                } else {
                    // If neither user nor contact found, show the UUID as fallback
                    setOwnerName(ownerId);
                }
            } catch (error) {
                console.error('Error in contact lookup:', error);
                setOwnerName(ownerId);
            } finally {
                setLoading(false);
            }
        };

        lookupContact();
    }, [ownerId, userDisplayName]);

    if (loading) {
        return 'Loading...';
    }

    return ownerName;
}
