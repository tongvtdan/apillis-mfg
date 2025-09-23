import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Users, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/core/auth";
import { WorkflowSubStage } from "@/types/project";

interface SubStageAssignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (subStageId: string, userId: string) => Promise<void>;
    subStage: WorkflowSubStage | null;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

export function SubStageAssignmentDialog({
    isOpen,
    onClose,
    onAssign,
    subStage
}: SubStageAssignmentDialogProps) {
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [assignmentNotes, setAssignmentNotes] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    // Load users when dialog opens
    useEffect(() => {
        if (isOpen && subStage) {
            loadUsers();
        }
    }, [isOpen, subStage]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedUserId('');
            setAssignmentNotes('');
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);

            // This would typically fetch users from a user service
            // For now, we'll use mock data that matches the responsible roles
            const mockUsers: User[] = [
                { id: '1', name: 'John Smith', email: 'john.smith@company.com', role: 'sales', isActive: true },
                { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'procurement', isActive: true },
                { id: '3', name: 'Mike Wilson', email: 'mike.wilson@company.com', role: 'engineering', isActive: true },
                { id: '4', name: 'Lisa Brown', email: 'lisa.brown@company.com', role: 'qa', isActive: true },
                { id: '5', name: 'David Lee', email: 'david.lee@company.com', role: 'production', isActive: true },
                { id: '6', name: 'Emma Davis', email: 'emma.davis@company.com', role: 'management', isActive: true },
            ];

            // Filter users based on responsible roles for this sub-stage
            if (subStage?.responsible_roles && subStage.responsible_roles.length > 0) {
                const filteredUsers = mockUsers.filter(user =>
                    subStage.responsible_roles!.includes(user.role)
                );
                setUsers(filteredUsers);
            } else {
                setUsers(mockUsers);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load users. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedUserId || !subStage) return;

        try {
            setIsAssigning(true);
            await onAssign(subStage.id, selectedUserId);
        } catch (error) {
            console.error('Error assigning sub-stage:', error);
            toast({
                variant: "destructive",
                title: "Assignment Failed",
                description: "Failed to assign sub-stage. Please try again.",
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            sales: 'bg-blue-100 text-blue-800',
            procurement: 'bg-green-100 text-green-800',
            engineering: 'bg-purple-100 text-purple-800',
            qa: 'bg-orange-100 text-orange-800',
            production: 'bg-teal-100 text-teal-800',
            management: 'bg-red-100 text-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getRoleIcon = (role: string) => {
        // Return appropriate icon based on role
        return <Users className="w-4 h-4" />;
    };

    if (!subStage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Assign Sub-Stage
                    </DialogTitle>
                    <DialogDescription>
                        Assign a team member to complete this sub-stage.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Sub-Stage Information */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">{subStage.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                            {subStage.description}
                        </p>

                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-muted-foreground">
                                Estimated: {subStage.estimated_duration_hours || 'N/A'} hours
                            </span>
                        </div>

                        {subStage.responsible_roles && subStage.responsible_roles.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">Roles:</span>
                                {subStage.responsible_roles.map((role) => (
                                    <Badge key={role} variant="secondary" className="text-xs">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* User Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="user-select">Select Team Member</Label>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Loading users...</span>
                            </div>
                        ) : (
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    {getRoleIcon(user.role)}
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getRoleColor(user.role)}`}
                                                >
                                                    {user.role}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Assignment Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="assignment-notes">Assignment Notes (Optional)</Label>
                        <Textarea
                            id="assignment-notes"
                            placeholder="Add any specific instructions or context for this assignment..."
                            value={assignmentNotes}
                            onChange={(e) => setAssignmentNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Selected User Info */}
                    {selectedUserId && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    {users.find(u => u.id === selectedUserId)?.name}
                                </span>
                            </div>
                            <p className="text-xs text-blue-700">
                                {users.find(u => u.id === selectedUserId)?.email}
                            </p>
                            <Badge
                                variant="secondary"
                                className={`text-xs mt-1 ${getRoleColor(users.find(u => u.id === selectedUserId)?.role || '')}`}
                            >
                                {users.find(u => u.id === selectedUserId)?.role}
                            </Badge>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isAssigning}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedUserId || isAssigning}
                    >
                        {isAssigning ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            'Assign Sub-Stage'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
