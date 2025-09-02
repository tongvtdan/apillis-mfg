import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

interface ApproverAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    stageId: string;
    organizationId: string;
    approvalRoles: string[];
    onAssign: () => void;
}

interface RoleApprovers {
    role: string;
    approvers: User[];
    selectedApprover: string | null;
}

export function ApproverAssignmentModal({
    isOpen,
    onClose,
    projectId,
    stageId,
    organizationId,
    approvalRoles,
    onAssign
}: ApproverAssignmentModalProps) {
    const [roleApprovers, setRoleApprovers] = useState<RoleApprovers[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && approvalRoles.length > 0) {
            fetchApprovers();
        }
    }, [isOpen, approvalRoles]);

    const fetchApprovers = async () => {
        try {
            setLoading(true);
            const rolesWithApprovers = await Promise.all(
                approvalRoles.map(async (role) => {
                    const { data: users, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('organization_id', organizationId)
                        .eq('role', role)
                        .eq('is_active', true);

                    if (error) throw error;

                    return {
                        role,
                        approvers: users || [],
                        selectedApprover: null
                    };
                })
            );

            setRoleApprovers(rolesWithApprovers);
        } catch (error) {
            console.error('Error fetching approvers:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load approvers.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApproverChange = (role: string, userId: string) => {
        setRoleApprovers(prev =>
            prev.map(ra =>
                ra.role === role
                    ? { ...ra, selectedApprover: userId }
                    : ra
            )
        );
    };

    const handleAssign = async () => {
        try {
            setLoading(true);

            // Validate that all roles have selected approvers
            const incompleteRoles = roleApprovers.filter(ra => !ra.selectedApprover);
            if (incompleteRoles.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: `Please select approvers for all roles: ${incompleteRoles.map(ra => ra.role).join(', ')}`
                });
                return;
            }

            // Prepare approvers data
            const approvers = roleApprovers.map(ra => ({
                roleId: ra.role,
                userId: ra.selectedApprover!
            }));

            // Call the approval service to create requests
            const response = await fetch('/api/approvals/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    stageId,
                    approvers,
                    organizationId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to assign approvers');
            }

            toast({
                title: 'Success',
                description: 'Approvers assigned successfully.'
            });

            onAssign();
            onClose();
        } catch (error) {
            console.error('Error assigning approvers:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to assign approvers.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Assign Approvers
                </div>
            }
            maxWidth="max-w-md"
        >

            <div className="space-y-4 py-4">
                {roleApprovers.map(({ role, approvers, selectedApprover }) => (
                    <div key={role} className="space-y-2">
                        <Label htmlFor={`approver-${role}`}>{role}</Label>
                        <Select
                            value={selectedApprover || ''}
                            onValueChange={(value) => handleApproverChange(role, value)}
                            disabled={loading}
                        >
                            <SelectTrigger id={`approver-${role}`}>
                                <SelectValue placeholder={`Select approver for ${role}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {approvers.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.display_name || user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleAssign} disabled={loading || roleApprovers.some(ra => !ra.selectedApprover)}>
                    {loading ? 'Assigning...' : 'Assign Approvers'}
                </Button>
            </div>
        </Modal>
    );
}