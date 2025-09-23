// Customer Organization Table Component
// Displays and manages customer organizations

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Building2,
    Users,
    Mail,
    Phone,
    MapPin,
    Globe,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Search,
    Plus,
    Star,
    Calendar
} from 'lucide-react';
import { CustomerOrganization } from '@/services/customerOrganizationService';
import { useCustomerOrganizations } from '@/hooks/useCustomerOrganizations';
import { CustomerOrganizationModal } from './CustomerOrganizationModal';

interface CustomerOrganizationTableProps {
    onOrganizationSelect?: (organization: CustomerOrganization) => void;
}

export function CustomerOrganizationTable({ onOrganizationSelect }: CustomerOrganizationTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrganization, setSelectedOrganization] = useState<CustomerOrganization | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [organizationToDelete, setOrganizationToDelete] = useState<CustomerOrganization | null>(null);

    const { organizations, loading, error, createOrganization, updateOrganization } = useCustomerOrganizations();

    const filteredOrganizations = useMemo(() => {
        if (!searchQuery) return organizations;

        const query = searchQuery.toLowerCase();
        return organizations.filter(org =>
            org.name.toLowerCase().includes(query) ||
            org.description?.toLowerCase().includes(query) ||
            org.industry?.toLowerCase().includes(query) ||
            org.country?.toLowerCase().includes(query) ||
            org.city?.toLowerCase().includes(query)
        );
    }, [organizations, searchQuery]);

    const handleEdit = (organization: CustomerOrganization) => {
        setSelectedOrganization(organization);
        setShowModal(true);
    };

    const handleDelete = (organization: CustomerOrganization) => {
        setOrganizationToDelete(organization);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (organizationToDelete) {
            try {
                // Note: Delete functionality would be implemented in the service
                console.log('Delete organization:', organizationToDelete.id);
                setShowDeleteDialog(false);
                setOrganizationToDelete(null);
            } catch (error) {
                console.error('Error deleting organization:', error);
            }
        }
    };

    const handleView = (organization: CustomerOrganization) => {
        if (onOrganizationSelect) {
            onOrganizationSelect(organization);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedOrganization(null);
    };

    const getPrimaryContact = (organization: CustomerOrganization) => {
        return organization.contacts?.find(contact => contact.is_primary_contact) || organization.contacts?.[0];
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading organizations...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-500">
                        <p>Error loading organizations: {error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Customer Organizations</h2>
                    <p className="text-muted-foreground">
                        Manage your customer organizations and their contacts
                    </p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Organization
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Organizations Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Organizations ({filteredOrganizations.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredOrganizations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Primary Contact</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Contacts</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrganizations.map((organization) => {
                                    const primaryContact = getPrimaryContact(organization);
                                    const contactCount = organization.contacts?.length || 0;

                                    return (
                                        <TableRow key={organization.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell onClick={() => handleView(organization)}>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{organization.name}</div>
                                                    {organization.description && (
                                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                                            {organization.description}
                                                        </div>
                                                    )}
                                                    {organization.website && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Globe className="h-3 w-3" />
                                                            <a
                                                                href={organization.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:text-primary"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                Website
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {organization.industry && (
                                                    <Badge variant="outline">{organization.industry}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {primaryContact ? (
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-sm">
                                                            {primaryContact.contact_name || 'Unnamed Contact'}
                                                            {primaryContact.is_primary_contact && (
                                                                <Star className="h-3 w-3 inline ml-1 text-yellow-500" />
                                                            )}
                                                        </div>
                                                        {primaryContact.email && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                {primaryContact.email}
                                                            </div>
                                                        )}
                                                        {primaryContact.phone && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Phone className="h-3 w-3" />
                                                                {primaryContact.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No contacts</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {organization.city && organization.country && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <MapPin className="h-3 w-3" />
                                                            {organization.city}, {organization.country}
                                                        </div>
                                                    )}
                                                    {organization.address && (
                                                        <div className="text-xs text-muted-foreground line-clamp-1">
                                                            {organization.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{contactCount}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(organization.created_at), 'MMM dd, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleView(organization)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(organization)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(organization)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No organizations found</p>
                            <p className="text-sm">
                                {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first customer organization to get started.'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            <CustomerOrganizationModal
                open={showModal}
                onClose={handleModalClose}
                organization={selectedOrganization}
            />

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && organizationToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600">Delete Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Are you sure you want to delete <strong>{organizationToDelete.name}</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
