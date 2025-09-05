// Customer Organization Management Component
// Handles organization-based customer model in the frontend

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Users,
    Mail,
    Phone,
    MapPin,
    Globe,
    Plus,
    Edit,
    Trash2,
    Star,
    UserCheck
} from 'lucide-react';
import { Organization, Contact } from '@/types/project';
import { useCustomerOrganizations, useCustomerOrganization } from '@/hooks/useCustomerOrganizations';
import { useToast } from '@/hooks/use-toast';

interface CustomerOrganizationModalProps {
    open: boolean;
    onClose: () => void;
    organization?: Organization | null;
}

interface OrganizationFormData {
    name: string;
    slug: string;
    description?: string;
    industry?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    website?: string;
}

const COUNTRIES = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
    'Finland', 'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore',
    'China', 'India', 'Brazil', 'Mexico', 'Vietnam', 'Other'
];

const INDUSTRIES = [
    'Automotive', 'Aerospace', 'Electronics', 'Manufacturing', 'Construction',
    'Energy', 'Healthcare', 'Food & Beverage', 'Textiles', 'Chemicals',
    'Pharmaceuticals', 'Telecommunications', 'Software', 'Other'
];

export function CustomerOrganizationModal({ open, onClose, organization }: CustomerOrganizationModalProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const { createOrganization, updateOrganization } = useCustomerOrganizations();
    const { toast } = useToast();

    const isEditing = !!organization;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<OrganizationFormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            industry: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postal_code: '',
            website: ''
        }
    });

    // Auto-generate slug from name
    const nameValue = watch('name');
    React.useEffect(() => {
        if (nameValue && !isEditing) {
            const slug = nameValue
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setValue('slug', slug);
        }
    }, [nameValue, setValue, isEditing]);

    // Reset form when organization changes
    React.useEffect(() => {
        if (organization) {
            reset({
                name: organization.name || '',
                slug: organization.slug || '',
                description: organization.description || '',
                industry: organization.industry || '',
                address: organization.address || '',
                city: organization.city || '',
                state: organization.state || '',
                country: organization.country || '',
                postal_code: organization.postal_code || '',
                website: organization.website || ''
            });
        } else {
            reset({
                name: '',
                slug: '',
                description: '',
                industry: '',
                address: '',
                city: '',
                state: '',
                country: '',
                postal_code: '',
                website: ''
            });
        }
    }, [organization, reset]);

    const onSubmit = async (data: OrganizationFormData) => {
        try {
            setLoading(true);

            const organizationData: Partial<Organization> = {
                name: data.name.trim(),
                slug: data.slug.trim(),
                description: data.description?.trim() || undefined,
                industry: data.industry || undefined,
                address: data.address?.trim() || undefined,
                city: data.city?.trim() || undefined,
                state: data.state?.trim() || undefined,
                country: data.country || undefined,
                postal_code: data.postal_code?.trim() || undefined,
                website: data.website?.trim() || undefined,
            };

            if (isEditing && organization) {
                await updateOrganization(organization.id, organizationData);
                toast({
                    title: "Organization Updated",
                    description: `${organizationData.name} has been updated successfully.`,
                });
            } else {
                await createOrganization(organizationData);
                toast({
                    title: "Organization Created",
                    description: `${organizationData.name} has been created successfully.`,
                });
            }

            onClose();
        } catch (error) {
            console.error('Error saving organization:', error);
            toast({
                title: "Error",
                description: "Failed to save organization. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
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
            title={isEditing ? 'Edit Customer Organization' : 'Create Customer Organization'}
            size="lg"
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Organization Details</TabsTrigger>
                    <TabsTrigger value="contacts" disabled={!isEditing}>
                        Contacts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Organization Name *</Label>
                                    <Input
                                        id="name"
                                        {...register('name', { required: 'Organization name is required' })}
                                        placeholder="e.g., Toyota Vietnam"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        {...register('slug', { required: 'Slug is required' })}
                                        placeholder="e.g., toyota-vietnam"
                                    />
                                    {errors.slug && (
                                        <p className="text-sm text-red-500">{errors.slug.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    placeholder="Brief description of the organization..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Select onValueChange={(value) => setValue('industry', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRIES.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Contact Information
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    {...register('address')}
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        {...register('city')}
                                        placeholder="City"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province</Label>
                                    <Input
                                        id="state"
                                        {...register('state')}
                                        placeholder="State or Province"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Select onValueChange={(value) => setValue('country', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRIES.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        {...register('postal_code')}
                                        placeholder="Postal/ZIP code"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        {...register('website')}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isValid || loading}
                            >
                                {loading ? 'Saving...' : isEditing ? 'Update Organization' : 'Create Organization'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-6">
                    {isEditing && organization && (
                        <OrganizationContactsTab organizationId={organization.id} />
                    )}
                </TabsContent>
            </Tabs>
        </Modal>
    );
}

// Organization Contacts Tab Component
interface OrganizationContactsTabProps {
    organizationId: string;
}

function OrganizationContactsTab({ organizationId }: OrganizationContactsTabProps) {
    const { organization, addContact, updateContact, setPrimaryContact } = useCustomerOrganization(organizationId);
    const [showAddContact, setShowAddContact] = useState(false);
    const { toast } = useToast();

    const handleSetPrimary = async (contactId: string) => {
        try {
            await setPrimaryContact(contactId);
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Organization Contacts
                </h3>
                <Button onClick={() => setShowAddContact(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                </Button>
            </div>

            {organization?.contacts && organization.contacts.length > 0 ? (
                <div className="space-y-3">
                    {organization.contacts.map((contact) => (
                        <Card key={contact.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{contact.contact_name || 'Unnamed Contact'}</h4>
                                        {contact.is_primary_contact && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Star className="h-3 w-3 mr-1" />
                                                Primary
                                            </Badge>
                                        )}
                                        {contact.role && (
                                            <Badge variant="outline" className="text-xs">
                                                {contact.role}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-1 text-sm text-muted-foreground">
                                        {contact.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3" />
                                                {contact.email}
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3" />
                                                {contact.phone}
                                            </div>
                                        )}
                                        {contact.description && (
                                            <p className="text-xs">{contact.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!contact.is_primary_contact && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetPrimary(contact.id)}
                                        >
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            Set Primary
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contacts added yet.</p>
                    <p className="text-sm">Add contacts to manage relationships with this organization.</p>
                </div>
            )}

            {/* Add Contact Modal would go here */}
            {showAddContact && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">Add Contact functionality will be implemented in the next step.</p>
                    <Button variant="outline" onClick={() => setShowAddContact(false)} className="mt-2">
                        Close
                    </Button>
                </div>
            )}
        </div>
    );
}
