import { useState } from 'react';
import { useAuth } from '@/core/auth';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { supabase } from '@/integrations/supabase/client.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCog, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ROLE_DESCRIPTIONS } from '@/lib/auth-constants';
import { UserProfile } from '@/core/auth';

interface RoleAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: UserProfile;
    onRoleUpdated: () => void;
}

type UserRole = 'sales' | 'procurement' | 'engineering' | 'qa' | 'production' | 'management' | 'admin';

export function RoleAssignmentModal({ isOpen, onClose, targetUser, onRoleUpdated }: RoleAssignmentModalProps) {
    const { profile } = useAuth();
    const { logRoleChange } = useAuditLogger();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: targetUser.role,
        department: targetUser.department || '',
        reason: ''
    });
    const [errors, setErrors] = useState<string[]>([]);

    const roles: { value: UserRole; label: string; description: string }[] = [
        { value: 'sales', label: 'Sales', description: ROLE_DESCRIPTIONS.sales },
        { value: 'procurement', label: 'Procurement', description: ROLE_DESCRIPTIONS.procurement },
        { value: 'engineering', label: 'Engineering', description: ROLE_DESCRIPTIONS.engineering },
        { value: 'qa', label: 'Quality Assurance', description: ROLE_DESCRIPTIONS.qa },
        { value: 'production', label: 'Production', description: ROLE_DESCRIPTIONS.production },
        { value: 'management', label: 'Management', description: ROLE_DESCRIPTIONS.management },
        { value: 'admin', label: 'Administrator', description: ROLE_DESCRIPTIONS.admin }
    ];

    // Filter roles based on current user's permissions
    const availableRoles = roles.filter(role => {
        if (!profile) return false;

        // Only admins can assign admin role
        if (role.value === 'admin' && profile.role !== 'admin') {
            return false;
        }

        // Only admins and management can assign management role
        if (role.value === 'management' && !['admin', 'management'].includes(profile.role)) {
            return false;
        }

        return true;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        // Validation
        const newErrors: string[] = [];

        if (!formData.role) {
            newErrors.push('Role is required');
        }

        if (!formData.reason.trim()) {
            newErrors.push('Reason for role change is required');
        }

        if (formData.role === targetUser.role) {
            newErrors.push('Please select a different role');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            // Update user role in database
            const { error } = await supabase
                .from('users')
                .update({
                    role: formData.role,
                    department: formData.department.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', targetUser.id);

            if (error) {
                throw error;
            }

            // Log the role change
            await logRoleChange(
                targetUser.role,
                formData.role,
                profile?.id
            );

            toast({
                title: "Role Updated",
                description: `${targetUser.name}'s role has been updated to ${formData.role}.`,
            });

            onRoleUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating role:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update user role. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedRole = roles.find(role => role.value === formData.role);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Update User Role
                </div>
            }
            description={`Update the role and permissions for ${targetUser.name}`}
            showDescription={true}
            maxWidth="max-w-[500px]"
        >

            {errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <ul className="list-disc pl-4 space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-role">Current Role</Label>
                    <Input
                        id="current-role"
                        value={targetUser.role}
                        disabled
                        className="bg-muted"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="new-role">New Role</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRoles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{role.label}</span>
                                        <span className="text-xs text-muted-foreground">{role.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedRole && (
                    <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium mb-1">Role Description:</p>
                        <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Enter department name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Change *</Label>
                    <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Explain why this role change is necessary..."
                        rows={3}
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Updating...
                            </>
                        ) : (
                            'Update Role'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}