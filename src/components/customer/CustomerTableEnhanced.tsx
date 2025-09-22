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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Modal } from '@/components/ui/modal';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Search,
    Users,
    AlertTriangle,
    Archive,
    TrendingUp,
    DollarSign,
    Calendar,
    BarChart3
} from 'lucide-react';
import { CustomerOrganizationWithSummary } from '@/types/project';
import { useCustomerOrganizations } from '@/hooks/useCustomerOrganizations';

interface CustomerTableProps {
    customers: CustomerOrganizationWithSummary[];
    onCustomerSelect?: (customer: CustomerOrganizationWithSummary) => void;
    onAddContact?: (customer: CustomerOrganizationWithSummary) => void;
    onEdit?: (customer: CustomerOrganizationWithSummary) => void;
    canArchive?: boolean;
}

export function CustomerTable({ customers, onCustomerSelect, onAddContact, onEdit, canArchive = false }: CustomerTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<CustomerOrganizationWithSummary | null>(null);

    const { deleteCustomer, archiveCustomer } = useCustomerOrganizations();

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;

        const query = searchQuery.toLowerCase();
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(query) ||
            customer.primary_contact?.contact_name?.toLowerCase().includes(query) ||
            customer.primary_contact?.email?.toLowerCase().includes(query) ||
            customer.country?.toLowerCase().includes(query) ||
            customer.industry?.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    const handleEdit = (customer: CustomerOrganizationWithSummary) => {
        onEdit?.(customer);
    };

    const handleArchive = async (customer: CustomerOrganizationWithSummary) => {
        try {
            await archiveCustomer(customer.id);
        } catch (error) {
            console.error('Error archiving customer:', error);
        }
    };

    const handleDelete = (customer: CustomerOrganizationWithSummary) => {
        setCustomerToDelete(customer);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (customerToDelete) {
            try {
                await deleteCustomer(customerToDelete.id);
                setShowDeleteDialog(false);
                setCustomerToDelete(null);
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    const handleView = (customer: CustomerOrganizationWithSummary) => {
        if (onCustomerSelect) {
            onCustomerSelect(customer);
        }
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'on_hold': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Search and Add Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Badge variant="secondary" className="ml-2">
                        <Users className="w-3 h-3 mr-1" />
                        {filteredCustomers.length} customers
                    </Badge>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Projects</TableHead>
                            <TableHead>Total Value</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Users className="w-8 h-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            {searchQuery ? 'No customers match your search' : 'No customers found'}
                                        </p>
                                        {!searchQuery && (
                                            <p className="text-muted-foreground">No customers found</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium flex items-center">
                                                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                                {customer.name}
                                            </div>
                                            {customer.industry && (
                                                <div className="text-sm text-muted-foreground">
                                                    {customer.industry}
                                                </div>
                                            )}
                                            {customer.primary_contact?.contact_name && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {customer.primary_contact.contact_name}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {customer.primary_contact?.email && (
                                                <div className="flex items-center text-sm">
                                                    <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                                                    <a
                                                        href={`mailto:${customer.primary_contact.email}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {customer.primary_contact.email}
                                                    </a>
                                                </div>
                                            )}
                                            {customer.primary_contact?.phone && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    <a
                                                        href={`tel:${customer.primary_contact.phone}`}
                                                        className="hover:text-foreground"
                                                    >
                                                        {customer.primary_contact.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm">
                                                <BarChart3 className="w-3 h-3 mr-1 text-muted-foreground" />
                                                <span className="font-medium">{customer.project_summary.total_projects}</span>
                                                <span className="text-muted-foreground ml-1">projects</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {customer.project_summary.active_projects > 0 && (
                                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                        {customer.project_summary.active_projects} active
                                                    </Badge>
                                                )}
                                                {customer.project_summary.completed_projects > 0 && (
                                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                                        {customer.project_summary.completed_projects} completed
                                                    </Badge>
                                                )}
                                                {customer.project_summary.on_hold_projects > 0 && (
                                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                                        {customer.project_summary.on_hold_projects} on hold
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm font-medium">
                                                <DollarSign className="w-3 h-3 mr-1 text-muted-foreground" />
                                                {formatCurrency(customer.project_summary.total_value)}
                                            </div>
                                            {customer.project_summary.avg_project_value > 0 && (
                                                <div className="text-xs text-muted-foreground">
                                                    Avg: {formatCurrency(customer.project_summary.avg_project_value)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {customer.city && (
                                                <div className="text-sm">
                                                    {customer.city}
                                                    {customer.state && `, ${customer.state}`}
                                                </div>
                                            )}
                                            {customer.country && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {customer.country}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                                            </div>
                                            {customer.project_summary.latest_project_date && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    Latest: {format(new Date(customer.project_summary.latest_project_date), 'MMM dd')}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(customer)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {onAddContact && (
                                                    <DropdownMenuItem onClick={() => onAddContact(customer)}>
                                                        <Users className="w-4 h-4 mr-2" />
                                                        Add Contact
                                                    </DropdownMenuItem>
                                                )}
                                                {canArchive && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleArchive(customer)}
                                                        className="text-orange-600"
                                                    >
                                                        <Archive className="w-4 h-4 mr-2" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>


            {/* Delete Confirmation Dialog */}
            <Modal
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                title={
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Delete Customer
                    </div>
                }
                description={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone. All associated projects will lose their customer reference.`}
                showDescription={true}
                maxWidth="max-w-md"
            >
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
