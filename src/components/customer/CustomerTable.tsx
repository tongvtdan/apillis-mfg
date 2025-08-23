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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    Plus,
    Users
} from 'lucide-react';
import { Customer } from '@/types/project';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerModal } from './CustomerModal';

interface CustomerTableProps {
    customers: Customer[];
    onCustomerSelect?: (customer: Customer) => void;
}

export function CustomerTable({ customers, onCustomerSelect }: CustomerTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    const { deleteCustomer, getCustomerProjects } = useCustomers();

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;

        const query = searchQuery.toLowerCase();
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(query) ||
            customer.company?.toLowerCase().includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.country?.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
    };

    const handleDelete = (customer: Customer) => {
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

    const handleView = (customer: Customer) => {
        if (onCustomerSelect) {
            onCustomerSelect(customer);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedCustomer(null);
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
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Users className="w-8 h-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            {searchQuery ? 'No customers match your search' : 'No customers found'}
                                        </p>
                                        {!searchQuery && (
                                            <Button variant="outline" onClick={() => setShowModal(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add First Customer
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{customer.name}</div>
                                            {customer.company && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    {customer.company}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {customer.email && (
                                                <div className="flex items-center text-sm">
                                                    <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                                                    <a
                                                        href={`mailto:${customer.email}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {customer.email}
                                                    </a>
                                                </div>
                                            )}
                                            {customer.phone && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    <a
                                                        href={`tel:${customer.phone}`}
                                                        className="hover:text-foreground"
                                                    >
                                                        {customer.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {customer.country && (
                                            <div className="flex items-center text-sm">
                                                <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                                                {customer.country}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground">
                                            {format(new Date(customer.created_at), 'MMM dd, yyyy')}
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
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(customer)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Customer Modal */}
            <CustomerModal
                open={showModal}
                onClose={handleModalClose}
                customer={selectedCustomer}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.
                            All associated projects will lose their customer reference.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}