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
    Plus,
    Users,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Archive
} from 'lucide-react';
import { Supplier, SPECIALTY_LABELS } from '@/types/supplier';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';

interface SupplierTableProps {
    suppliers: Supplier[];
    onSupplierSelect?: (supplier: Supplier) => void;
    onSupplierEdit?: (supplier: Supplier) => void;
    canArchive?: boolean;
}

export function SupplierTable({ suppliers, onSupplierSelect, onSupplierEdit, canArchive = false }: SupplierTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    const { deleteSupplier, archiveSupplier } = useSuppliers();

    const filteredSuppliers = useMemo(() => {
        if (!searchQuery) return suppliers;

        const query = searchQuery.toLowerCase();
        return suppliers.filter(supplier =>
            (supplier.name || supplier.company_name || '').toLowerCase().includes(query) ||
            (supplier.company || supplier.company_name || '').toLowerCase().includes(query) ||
            (supplier.email || '').toLowerCase().includes(query) ||
            (supplier.country || '').toLowerCase().includes(query) ||
            (supplier.specialties || []).some(specialty =>
                SPECIALTY_LABELS[specialty]?.toLowerCase().includes(query)
            ) ||
            (supplier.capabilities || []).some(capability =>
                capability.toLowerCase().includes(query)
            )
        );
    }, [suppliers, searchQuery]);

    const handleEdit = (supplier: Supplier) => {
        if (onSupplierEdit) {
            onSupplierEdit(supplier);
        }
    };

    const handleArchive = async (supplier: Supplier) => {
        try {
            await archiveSupplier(supplier.id);
        } catch (error) {
            console.error('Error archiving supplier:', error);
        }
    };

    const handleDelete = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (supplierToDelete) {
            try {
                await deleteSupplier(supplierToDelete.id);
                setShowDeleteDialog(false);
                setSupplierToDelete(null);
            } catch (error) {
                console.error('Error deleting supplier:', error);
            }
        }
    };

    const handleView = (supplier: Supplier) => {
        if (onSupplierSelect) {
            onSupplierSelect(supplier);
        }
    };

    const renderRating = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
        );
    };

    const renderResponseRate = (rate: number) => {
        const color = rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-yellow-600' : 'text-red-600';
        return (
            <div className={`flex items-center space-x-1 ${color}`}>
                <CheckCircle className="w-3 h-3" />
                <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
            </div>
        );
    };

    const renderTurnaroundTime = (days: number) => {
        const color = days <= 2 ? 'text-green-600' : days <= 5 ? 'text-yellow-600' : 'text-red-600';
        return (
            <div className={`flex items-center space-x-1 ${color}`}>
                <Clock className="w-3 h-3" />
                <span className="text-sm font-medium">{days.toFixed(1)}d</span>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header with Search */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search suppliers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <Badge variant="secondary" className="ml-2">
                        <Users className="w-3 h-3 mr-1" />
                        {filteredSuppliers.length} suppliers
                    </Badge>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Specialties</TableHead>
                            <TableHead>Performance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Users className="w-8 h-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            {searchQuery ? 'No suppliers match your search' : 'No suppliers found'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">{supplier.name || supplier.company_name || 'Unnamed Supplier'}</div>
                                            {(supplier.company || supplier.company_name) && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    {supplier.company || supplier.company_name}
                                                </div>
                                            )}
                                            {supplier.country && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {supplier.country}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {supplier.email && (
                                                <div className="flex items-center text-sm">
                                                    <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                                                    <a
                                                        href={`mailto:${supplier.email}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {supplier.email}
                                                    </a>
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    <a
                                                        href={`tel:${supplier.phone}`}
                                                        className="hover:text-foreground"
                                                    >
                                                        {supplier.phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(supplier.specialties || []).slice(0, 3).map((specialty) => (
                                                <Badge key={specialty} variant="secondary" className="text-xs">
                                                    {SPECIALTY_LABELS[specialty]}
                                                </Badge>
                                            ))}
                                            {(supplier.specialties || []).length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{(supplier.specialties || []).length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {renderRating(supplier.rating || supplier.performance_rating || 0)}
                                            {renderResponseRate(supplier.response_rate || 0)}
                                            {renderTurnaroundTime(supplier.average_turnaround_days || 0)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={supplier.is_active ? "default" : "secondary"}
                                            className={supplier.is_active ? "bg-green-100 text-green-800" : ""}
                                        >
                                            {supplier.is_active ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Inactive
                                                </>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleView(supplier)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                {canArchive && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleArchive(supplier)}
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
                        Delete Supplier
                    </div>
                }
                description={`Are you sure you want to delete ${supplierToDelete?.name}? This action cannot be undone. All associated quotes and performance data will be lost.`}
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