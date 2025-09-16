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
    Archive,
    Award,
    Send
} from 'lucide-react';
import { Supplier, SPECIALTY_LABELS } from '@/types/supplier';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';

// Import the new components
import { SupplierQualificationProgress } from './SupplierQualificationProgress';
import { FinalApprovalModal } from './FinalApprovalModal';
import { RFQDistributionModal } from './RFQDistributionModal';

// Extend the Supplier type to include qualification fields
interface ExtendedSupplier extends Supplier {
    qualificationStatus?: 'not_started' | 'in_progress' | 'pending_approval' | 'qualified' | 'qualified_with_conditions' | 'qualified_as_exception' | 'rejected' | 'expired';
    qualificationExpiry?: string;
    responseRate?: number;
    averageTurnaroundDays?: number;
    capabilities?: string[];
    company_name?: string;
}

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
    const [showQualificationProgress, setShowQualificationProgress] = useState(false);
    const [showFinalApproval, setShowFinalApproval] = useState(false);
    const [showRFQDistribution, setShowRFQDistribution] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const { deleteSupplier, archiveSupplier } = useSuppliers();

    // Mock data for demonstration
    const mockSuppliers: ExtendedSupplier[] = suppliers.map(supplier => ({
        ...supplier,
        qualificationStatus: 'qualified',
        qualificationExpiry: 'Dec 15, 2026',
        responseRate: supplier.response_rate || 0,
        averageTurnaroundDays: supplier.average_turnaround_days || 0,
        capabilities: supplier.tags || [],
        company_name: supplier.company
    }));

    const filteredSuppliers = useMemo(() => {
        if (!searchQuery) return mockSuppliers;

        const query = searchQuery.toLowerCase();
        return mockSuppliers.filter(supplier =>
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
    }, [mockSuppliers, searchQuery]);

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

    const handleViewQualification = (supplier: ExtendedSupplier) => {
        setSelectedSupplier(supplier);
        setShowQualificationProgress(true);
    };

    const handleFinalApproval = (supplier: ExtendedSupplier) => {
        setSelectedSupplier(supplier);
        setShowFinalApproval(true);
    };

    const handleSendRFQ = (supplier: ExtendedSupplier) => {
        setSelectedSupplier(supplier);
        setShowRFQDistribution(true);
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

    const handleSubmitApproval = (decision: any) => {
        console.log('Approval decision:', decision);
        setShowFinalApproval(false);
        setSelectedSupplier(null);
        // In a real implementation, this would call an API to update the supplier's qualification status
    };

    const handleSubmitRFQ = (data: any) => {
        console.log('RFQ data:', data);
        setShowRFQDistribution(false);
        setSelectedSupplier(null);
        // In a real implementation, this would call an API to create and send RFQs
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
                            <TableHead>Qualification</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
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
                                            {renderRating(supplier.rating || 0)}
                                            {renderResponseRate(supplier.responseRate || 0)}
                                            {renderTurnaroundTime(supplier.averageTurnaroundDays || 0)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Badge
                                                className={
                                                    supplier.qualificationStatus === 'qualified' ? 'bg-green-100 text-green-800' :
                                                        supplier.qualificationStatus === 'qualified_with_conditions' ? 'bg-yellow-100 text-yellow-800' :
                                                            supplier.qualificationStatus === 'qualified_as_exception' ? 'bg-orange-100 text-orange-800' :
                                                                supplier.qualificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                    supplier.qualificationStatus === 'expired' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                }
                                            >
                                                {supplier.qualificationStatus === 'qualified' && 'Qualified ✅'}
                                                {supplier.qualificationStatus === 'qualified_with_conditions' && 'Qualified ⚠️'}
                                                {supplier.qualificationStatus === 'qualified_as_exception' && 'Exception ⚠️'}
                                                {supplier.qualificationStatus === 'rejected' && 'Rejected ❌'}
                                                {supplier.qualificationStatus === 'expired' && 'Expired ⚠️'}
                                                {supplier.qualificationStatus === 'not_started' && 'Not Started'}
                                                {supplier.qualificationStatus === 'in_progress' && 'In Progress'}
                                                {supplier.qualificationStatus === 'pending_approval' && 'Pending'}
                                            </Badge>
                                            {supplier.qualificationExpiry && (
                                                <div className="text-xs text-muted-foreground">
                                                    Exp: {supplier.qualificationExpiry}
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
                                                <DropdownMenuItem onClick={() => handleView(supplier)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleViewQualification(supplier)}>
                                                    <Award className="w-4 h-4 mr-2" />
                                                    Qualification
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSendRFQ(supplier)}>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send RFQ
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
                                                <DropdownMenuItem
                                                    onClick={() => handleFinalApproval(supplier)}
                                                    className="text-blue-600"
                                                >
                                                    <Award className="w-4 h-4 mr-2" />
                                                    Final Approval
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

            {/* Supplier Qualification Progress Modal */}
            {showQualificationProgress && selectedSupplier && (
                <Modal
                    isOpen={showQualificationProgress}
                    onClose={() => {
                        setShowQualificationProgress(false);
                        setSelectedSupplier(null);
                    }}
                    title=""
                    maxWidth="max-w-4xl"
                    showCloseButton={true}
                >
                    <SupplierQualificationProgress
                        supplier={{
                            id: selectedSupplier.id,
                            name: selectedSupplier.name || 'Unnamed Supplier',
                            qualificationStatus: (selectedSupplier as ExtendedSupplier).qualificationStatus || 'not_started',
                            qualificationExpiry: (selectedSupplier as ExtendedSupplier).qualificationExpiry
                        }}
                        onRequalify={() => {
                            console.log('Requalify supplier');
                            setShowQualificationProgress(false);
                        }}
                        onViewProfile={() => {
                            console.log('View supplier profile');
                        }}
                        onSendRFQ={() => {
                            handleSendRFQ(selectedSupplier as ExtendedSupplier);
                            setShowQualificationProgress(false);
                        }}
                        onBlockSupplier={() => {
                            console.log('Block supplier');
                        }}
                        onExportReport={() => {
                            console.log('Export qualification report');
                        }}
                    />
                </Modal>
            )}

            {/* Final Approval Modal */}
            {showFinalApproval && selectedSupplier && (
                <FinalApprovalModal
                    isOpen={showFinalApproval}
                    onClose={() => {
                        setShowFinalApproval(false);
                        setSelectedSupplier(null);
                    }}
                    supplier={{
                        id: selectedSupplier.id,
                        name: selectedSupplier.name || 'Unnamed Supplier'
                    }}
                    onSubmit={handleSubmitApproval}
                />
            )}

            {/* RFQ Distribution Modal */}
            {showRFQDistribution && selectedSupplier && (
                <RFQDistributionModal
                    isOpen={showRFQDistribution}
                    onClose={() => {
                        setShowRFQDistribution(false);
                        setSelectedSupplier(null);
                    }}
                    project={{
                        id: 'project-123',
                        title: 'Sample Project'
                    }}
                    suppliers={mockSuppliers.map(s => ({
                        id: s.id,
                        name: s.name || 'Unnamed Supplier',
                        qualificationStatus: s.qualificationStatus || 'not_started',
                        specialties: s.specialties || [],
                        responseRate: s.responseRate || 0,
                        averageTurnaroundDays: s.averageTurnaroundDays || 0
                    }))}
                    onSubmit={handleSubmitRFQ}
                />
            )}
        </div>
    );
}