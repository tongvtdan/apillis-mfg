import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Users,
    UserPlus,
    X,
    Save,
    AlertCircle
} from 'lucide-react';
import { Department } from '@/types/review';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
}

interface ReviewAssignment {
    department: Department;
    reviewerId: string | null;
    reviewerName?: string;
}

interface ReviewAssignmentModalProps {
    projectId: string;
    onClose: () => void;
    onSave: (assignments: ReviewAssignment[]) => Promise<void>;
    currentAssignments?: Record<Department, string | null>;
    availableUsers?: User[];
}

const mockUsers: User[] = [
    { id: '1', name: 'John Smith', email: 'john.smith@company.com', role: 'Engineer', department: 'Engineering' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'QA Engineer', department: 'QA' },
    { id: '3', name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Production Manager', department: 'Production' },
    { id: '4', name: 'Lisa Wang', email: 'lisa.wang@company.com', role: 'Senior Engineer', department: 'Engineering' },
    { id: '5', name: 'David Brown', email: 'david.brown@company.com', role: 'QA Lead', department: 'QA' },
    { id: '6', name: 'Emma Wilson', email: 'emma.wilson@company.com', role: 'Production Lead', department: 'Production' },
];

const departments: Department[] = ['Engineering', 'QA', 'Production'];

export function ReviewAssignmentModal({
    projectId,
    onClose,
    onSave,
    currentAssignments = { Production: '', Engineering: '', QA: '' },
    availableUsers = mockUsers
}: ReviewAssignmentModalProps) {
    const [assignments, setAssignments] = useState<ReviewAssignment[]>(
        departments.map(dept => ({
            department: dept,
            reviewerId: currentAssignments[dept] || null,
            reviewerName: currentAssignments[dept]
                ? availableUsers.find(u => u.id === currentAssignments[dept])?.name
                : undefined
        }))
    );
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const updateAssignment = (department: Department, reviewerId: string | null) => {
        const user = availableUsers.find(u => u.id === reviewerId);
        setAssignments(prev =>
            prev.map(a =>
                a.department === department
                    ? { ...a, reviewerId, reviewerName: user?.name }
                    : a
            )
        );
        setHasChanges(true);
    };

    const getUsersByDepartment = (department: Department) => {
        return availableUsers.filter(user =>
            user.department === department || user.role.toLowerCase().includes(department.toLowerCase())
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(assignments);
            setHasChanges(false);
            onClose();
        } catch (error) {
            console.error('Failed to save assignments:', error);
        } finally {
            setSaving(false);
        }
    };

    const getAssignmentStatus = (assignment: ReviewAssignment) => {
        if (assignment.reviewerId) {
            return { status: 'assigned', color: 'bg-green-100 text-green-800 border-green-200' };
        }
        return { status: 'unassigned', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Review Assignment
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Assign reviewers for each department review. Unassigned reviews will be automatically assigned based on workload.
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                {assignments.map((assignment) => {
                    const status = getAssignmentStatus(assignment);
                    const departmentUsers = getUsersByDepartment(assignment.department);

                    return (
                        <div key={assignment.department} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{assignment.department} Review</h3>
                                    <Badge className={status.color}>
                                        {status.status === 'assigned' ? 'Assigned' : 'Unassigned'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Reviewer</Label>
                                <Select
                                    value={assignment.reviewerId || "auto-assign"}
                                    onValueChange={(value) => updateAssignment(assignment.department, value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select reviewer or leave unassigned for auto-assignment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto-assign">Auto-assign (Recommended)</SelectItem>
                                        {departmentUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                <div className="flex flex-col">
                                                    <span>{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.role}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {assignment.reviewerName && (
                                    <div className="text-sm text-muted-foreground">
                                        Currently assigned to: <span className="font-medium">{assignment.reviewerName}</span>
                                    </div>
                                )}
                            </div>

                            {assignment.department !== departments[departments.length - 1] && (
                                <Separator />
                            )}
                        </div>
                    );
                })}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Auto-assignment Benefits:</p>
                            <ul className="space-y-1">
                                <li>• Balances workload across team members</li>
                                <li>• Ensures reviews are assigned to qualified personnel</li>
                                <li>• Automatically handles vacation and availability</li>
                                <li>• Maintains consistent review quality</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Assignments'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
