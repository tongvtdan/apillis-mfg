// Project Contact Points Management Component
// Manages project-specific contact points for customer organizations

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    Mail,
    Phone,
    Plus,
    Edit,
    Trash2,
    Star,
    UserCheck,
    Building2
} from 'lucide-react';
import { Project, Contact, ProjectContactPoint } from '@/types/project';
import { useProjectContactPoints } from '@/hooks/useCustomerOrganizations';
import { useCustomerOrganizations } from '@/hooks/useCustomerOrganizations';
import { useToast } from '@/hooks/use-toast';

interface ProjectContactPointsModalProps {
    open: boolean;
    onClose: () => void;
    project: Project;
}

interface ContactPointFormData {
    contact_id: string;
    role: string;
    is_primary: boolean;
}

const CONTACT_ROLES = [
    'general', 'purchasing', 'engineering', 'quality', 'project_manager',
    'technical', 'commercial', 'logistics', 'finance', 'executive'
];

export function ProjectContactPointsModal({ open, onClose, project }: ProjectContactPointsModalProps) {
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const { contactPoints, loading: pointsLoading, addContactPoint, updateContactPoint, removeContactPoint } = useProjectContactPoints(project.id);
    const { organizations } = useCustomerOrganizations();
    const { toast } = useToast();

    // Get the customer organization for this project
    const customerOrganization = organizations.find(org => org.id === project.customer_organization_id);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<ContactPointFormData>({
        mode: 'onChange',
        defaultValues: {
            contact_id: '',
            role: 'general',
            is_primary: false
        }
    });

    const onSubmit = async (data: ContactPointFormData) => {
        try {
            setLoading(true);
            await addContactPoint(data.contact_id, data.role, data.is_primary);

            toast({
                title: "Contact Point Added",
                description: "Contact point has been added to the project successfully.",
            });

            reset();
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding contact point:', error);
            toast({
                title: "Error",
                description: "Failed to add contact point. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSetPrimary = async (contactPointId: string) => {
        try {
            await updateContactPoint(contactPointId, { is_primary: true });
            toast({
                title: "Primary Contact Updated",
                description: "Primary contact has been updated successfully.",
            });
        } catch (error) {
            console.error('Error setting primary contact:', error);
            toast({
                title: "Error",
                description: "Failed to update primary contact.",
                variant: "destructive",
            });
        }
    };

    const handleRemoveContactPoint = async (contactPointId: string) => {
        try {
            await removeContactPoint(contactPointId);
            toast({
                title: "Contact Point Removed",
                description: "Contact point has been removed from the project.",
            });
        } catch (error) {
            console.error('Error removing contact point:', error);
            toast({
                title: "Error",
                description: "Failed to remove contact point.",
                variant: "destructive",
            });
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title={`Project Contact Points - ${project.title}`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Project Info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Project Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Project ID:</span>
                                <div className="font-medium">{project.project_id}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Customer Organization:</span>
                                <div className="font-medium">
                                    {customerOrganization?.name || 'Not assigned'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Points */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Contact Points ({contactPoints.length})
                        </h3>
                        {customerOrganization && (
                            <Button
                                onClick={() => setShowAddForm(true)}
                                size="sm"
                                disabled={!customerOrganization}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Contact Point
                            </Button>
                        )}
                    </div>

                    {!customerOrganization && (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No Customer Organization</p>
                                <p className="text-sm">This project needs to be assigned to a customer organization before adding contact points.</p>
                            </CardContent>
                        </Card>
                    )}

                    {pointsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-2">Loading contact points...</span>
                        </div>
                    ) : contactPoints.length > 0 ? (
                        <div className="space-y-3">
                            {contactPoints.map((contactPoint) => (
                                <Card key={contactPoint.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">
                                                    {contactPoint.contact?.contact_name || 'Unnamed Contact'}
                                                </h4>
                                                {contactPoint.is_primary && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Primary
                                                    </Badge>
                                                )}
                                                {contactPoint.role && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {contactPoint.role}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {contactPoint.contact?.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        {contactPoint.contact.email}
                                                    </div>
                                                )}
                                                {contactPoint.contact?.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3 w-3" />
                                                        {contactPoint.contact.phone}
                                                    </div>
                                                )}
                                                {contactPoint.contact?.description && (
                                                    <p className="text-xs">{contactPoint.contact.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!contactPoint.is_primary && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetPrimary(contactPoint.id)}
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    Set Primary
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveContactPoint(contactPoint.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : customerOrganization ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No contact points added yet</p>
                            <p className="text-sm">Add contact points to manage relationships for this project.</p>
                        </div>
                    ) : null}
                </div>

                {/* Add Contact Point Form */}
                {showAddForm && customerOrganization && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add Contact Point</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_id">Contact *</Label>
                                    <Select onValueChange={(value) => setValue('contact_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a contact" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customerOrganization.contacts?.map((contact) => (
                                                <SelectItem key={contact.id} value={contact.id}>
                                                    {contact.contact_name || 'Unnamed Contact'}
                                                    {contact.is_primary_contact && ' (Primary)'}
                                                    {contact.role && ` - ${contact.role}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.contact_id && (
                                        <p className="text-sm text-red-500">{errors.contact_id.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select onValueChange={(value) => setValue('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CONTACT_ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_primary"
                                        {...register('is_primary')}
                                        className="rounded"
                                    />
                                    <Label htmlFor="is_primary">Set as primary contact</Label>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            reset();
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!isValid || loading}
                                    >
                                        {loading ? 'Adding...' : 'Add Contact Point'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
