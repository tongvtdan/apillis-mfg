import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/shared/hooks/use-toast';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Star,
    Clock,
    CheckCircle,
    Award,
    TrendingUp,
    DollarSign,
    Calendar,
    Users,
    FileText,
    AlertTriangle,
    Edit,
    Trash2,
    ArrowLeft,
    RefreshCw,
    Send,
    Download,
    Archive,
    Eye,
    Save,
    X
} from 'lucide-react';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';
import { usePermissions } from '@/core/auth/hooks/usePermissions';
import { useSupplierDocuments } from '@/hooks/useSupplierDocuments';
import { SupplierProfileActions } from '@/components/supplier/SupplierProfileActions';
import { SupplierEditModal } from '@/components/supplier/SupplierEditModal';
import { SupplierDeleteModal } from '@/components/supplier/SupplierDeleteModal';
import { SupplierManagementService } from '@/features/supplier-management/services/supplierManagementService';
import { useAuth } from '@/core/auth';

// Capability name mapping for readable display
const CAPABILITY_LABELS: Record<string, string> = {
    machining: 'CNC Machining',
    fabrication: 'Metal Fabrication',
    casting: 'Casting & Molding',
    finishing: 'Surface Finishing',
    injection_molding: 'Injection Molding',
    assembly: 'Assembly Services',
    '3d_printing': '3D Printing',
    prototyping: 'Rapid Prototyping',
    coating: 'Coating Services',
    painting: 'Painting & Powder Coating',
    welding: 'Welding Services',
    sheet_metal: 'Sheet Metal Work',
    electronics: 'Electronics Assembly',
    testing: 'Testing & Validation',
    packaging: 'Packaging Services'
};

// Document category mapping for readable display
const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
    supplier_nda: 'Non-Disclosure Agreement',
    certificate: 'Certificates',
    qualification: 'Qualification Documents',
    contract: 'Contracts',
    insurance: 'Insurance Documents',
    compliance: 'Compliance Documents',
    financial: 'Financial Documents',
    technical: 'Technical Specifications',
    quality: 'Quality Documents',
    safety: 'Safety Documents',
    environmental: 'Environmental Documents',
    audit: 'Audit Reports',
    license: 'Licenses & Permits',
    warranty: 'Warranty Documents',
    other: 'Other Documents'
};

// Helper function to convert capability names to readable text
const getReadableCapabilityName = (capability: string): string => {
    return CAPABILITY_LABELS[capability] || capability;
};

// Helper function to convert document category names to readable text
const getReadableDocumentCategory = (category: string): string => {
    return DOCUMENT_CATEGORY_LABELS[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Mock suppliers for demonstration when no real data is available
const MOCK_SUPPLIERS = [
    {
        id: '1',
        name: 'Acme Precision Machining',
        company: 'Acme Precision Machining',
        email: 'contact@acmeprecision.com',
        phone: '+1 (555) 123-4567',
        website: 'https://acmeprecision.com',
        specialties: ['5-Axis', '±0.01mm', 'ISO 9001'],
        status: 'qualified',
        expiryDate: 'Dec 2026',
        capabilities: ['5-Axis', '±0.01mm', 'ISO 9001'],
        performance: {
            rating: 4.8,
            responseRate: 98,
            turnaroundDays: 3.2,
            qualityScore: 95,
            costCompetitiveness: 85
        },
        country: 'USA',
        supplierType: 'manufacturer',
        lastActivity: '2025-09-10',
        annualSpend: 125000,
        paymentTerms: 'Net 30'
    },
    {
        id: '2',
        name: 'Titan Metalworks',
        company: 'Titan Metalworks',
        email: 'info@titanmetalworks.com',
        phone: '+1 (555) 234-5678',
        website: 'https://titanmetalworks.com',
        specialties: ['Sheet Metal', 'Welding', 'ISO 14001'],
        status: 'expiring_soon',
        expiryDate: 'Oct 2025',
        capabilities: ['Sheet Metal', 'Welding', 'ISO 14001'],
        performance: {
            rating: 4.2,
            responseRate: 92,
            turnaroundDays: 4.1,
            qualityScore: 88,
            costCompetitiveness: 92
        },
        country: 'USA',
        supplierType: 'manufacturer',
        lastActivity: '2025-09-08',
        annualSpend: 87000,
        paymentTerms: 'Net 45'
    }
];

export default function SupplierProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { suppliers, loading, fetchSuppliers } = useSuppliers();
    const { canManageSuppliers } = usePermissions();
    const { documents, loading: documentsLoading, downloadDocument, deleteDocument } = useSupplierDocuments(id || '');
    const { toast } = useToast();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [canManage, setCanManage] = useState(false);

    // Inline editing state
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Global error handler for browser extension interference
    useEffect(() => {
        const handleGlobalError = (event: ErrorEvent) => {
            if (event.message?.includes('ControlLooksLikePasswordCredentialField') ||
                event.message?.includes('content_script')) {
                console.warn('Browser extension interference detected, ignoring:', event.message);
                event.preventDefault();
                return false;
            }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes('ControlLooksLikePasswordCredentialField') ||
                event.reason?.message?.includes('content_script')) {
                console.warn('Browser extension promise rejection detected, ignoring:', event.reason);
                event.preventDefault();
                return false;
            }
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    // Find the supplier by ID - check both real data and mock data
    const supplier = suppliers.find(s => s.id === id) || MOCK_SUPPLIERS.find(s => s.id === id);

    // Type assertion to handle mixed data types
    const supplierData = supplier as any;

    useEffect(() => {
        const checkPermissions = async () => {
            const canManageResult = await canManageSuppliers();
            setCanManage(canManageResult);
        };
        checkPermissions();
    }, [canManageSuppliers]);

    const handlePreviewDocument = (doc: any) => {
        navigate(`/suppliers/${id}/documents/${doc.id}/preview`);
    };

    // Inline editing functions
    const startEditing = (field: string, currentValue: string) => {
        try {
            if (!canManage) return;
            setEditingField(field);
            setEditValue(currentValue || '');
        } catch (error) {
            console.warn('Start editing error:', error);
        }
    };

    const cancelEditing = () => {
        try {
            setEditingField(null);
            setEditValue('');
        } catch (error) {
            console.warn('Cancel editing error:', error);
            // Force reset state
            setEditingField(null);
            setEditValue('');
        }
    };

    const saveEdit = async () => {
        if (!editingField || !supplierData || !user?.id) return;

        setIsSaving(true);
        try {
            // Prepare update data based on the field being edited
            const updateData: any = {};

            switch (editingField) {
                case 'companyName':
                    updateData.name = editValue;
                    break;
                case 'contactName':
                    updateData.primaryContactName = editValue;
                    break;
                case 'email':
                    updateData.email = editValue;
                    break;
                case 'phone':
                    updateData.phone = editValue;
                    break;
                case 'address':
                    updateData.address = editValue;
                    break;
                case 'city':
                    updateData.city = editValue;
                    break;
                case 'state':
                    updateData.state = editValue;
                    break;
                case 'country':
                    updateData.country = editValue;
                    break;
                case 'postalCode':
                    updateData.postalCode = editValue;
                    break;
                case 'website':
                    updateData.website = editValue;
                    break;
                case 'annualSpend':
                    updateData.annualSpend = parseFloat(editValue.replace(/[^0-9.-]/g, '')) || 0;
                    break;
                case 'currency':
                    updateData.currency = editValue;
                    break;
                case 'paymentTerms':
                    updateData.paymentTerms = editValue;
                    break;
                case 'taxId':
                    updateData.taxId = editValue;
                    break;
                default:
                    console.warn('Unknown field for editing:', editingField);
                    return;
            }

            console.log('Saving field update:', { field: editingField, value: editValue, updateData });

            // Call the supplier management service to update the supplier
            await SupplierManagementService.updateSupplier(supplierData.id, updateData, user.id);

            toast({
                title: "Success",
                description: `${editingField} updated successfully`
            });

            // Refresh supplier data
            await fetchSuppliers();

            setEditingField(null);
            setEditValue('');
        } catch (error) {
            console.warn('Save edit error:', error);
            toast({
                title: "Error",
                description: `Failed to update ${editingField}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        try {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancelEditing();
            }
        } catch (error) {
            console.warn('Key press handling error:', error);
            cancelEditing();
        }
    };

    // Inline edit component
    const InlineEditField = ({
        field,
        value,
        label,
        type = 'text',
        placeholder = '',
        icon: Icon,
        href,
        className = ''
    }: {
        field: string;
        value: string;
        label: string;
        type?: string;
        placeholder?: string;
        icon?: React.ComponentType<{ className?: string }>;
        href?: string;
        className?: string;
    }) => {
        const isEditing = editingField === field;

        return (
            <div className="group">
                <label className="text-sm font-medium text-muted-foreground">{label}</label>
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                        {Icon && <Icon className="w-4 h-4 mr-2 text-muted-foreground" />}
                        {isEditing ? (
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    type={type}
                                    value={editValue}
                                    onChange={(e) => {
                                        try {
                                            setEditValue(e.target.value);
                                        } catch (error) {
                                            console.warn('Input change error:', error);
                                            // Fallback: cancel editing if there's an error
                                            cancelEditing();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        try {
                                            handleKeyPress(e);
                                        } catch (error) {
                                            console.warn('Key press error:', error);
                                            // Fallback: cancel editing if there's an error
                                            cancelEditing();
                                        }
                                    }}
                                    onBlur={(e) => {
                                        // Only auto-save on blur if the value has changed
                                        if (e.target.value !== value) {
                                            try {
                                                saveEdit();
                                            } catch (error) {
                                                console.warn('Auto-save error:', error);
                                                cancelEditing();
                                            }
                                        }
                                    }}
                                    placeholder={placeholder}
                                    className="flex-1"
                                    autoFocus
                                    autoComplete="off"
                                    data-lpignore="true"
                                    data-form-type="other"
                                />
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        try {
                                            saveEdit();
                                        } catch (error) {
                                            console.warn('Save button error:', error);
                                            cancelEditing();
                                        }
                                    }}
                                    disabled={isSaving}
                                    className="h-8 w-8 p-0"
                                >
                                    <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        try {
                                            cancelEditing();
                                        } catch (error) {
                                            console.warn('Cancel button error:', error);
                                            setEditingField(null);
                                            setEditValue('');
                                        }
                                    }}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center flex-1">
                                {href ? (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {value || 'Not provided'}
                                    </a>
                                ) : (
                                    <span className={className}>{value || 'Not provided'}</span>
                                )}
                                {canManage && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            try {
                                                startEditing(field, value);
                                            } catch (error) {
                                                console.warn('Start editing error:', error);
                                            }
                                        }}
                                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading supplier profile...</p>
                </div>
            </div>
        );
    }

    if (!supplierData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Supplier Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The supplier you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={() => navigate('/suppliers')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Suppliers
                    </Button>
                </div>
            </div>
        );
    }

    const getStatusBadge = (supplier: any) => {
        // Handle different status field names from real data
        const status = supplier.status || supplier.qualificationStatus || 'unknown';
        const isActive = supplier.is_active !== false;

        if (!isActive) {
            return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
        }

        switch (status) {
            case 'qualified':
            case 'active':
                return <Badge className="bg-green-100 text-green-800">Qualified ✅</Badge>;
            case 'expiring_soon':
            case 'expired':
                return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon ⚠️</Badge>;
            case 'not_qualified':
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Not Qualified ❌</Badge>;
            case 'in_progress':
            case 'in_review':
            case 'pending_approval':
                return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
        }
    };

    const getSupplierTypeBadge = (type: string) => {
        const typeConfigs = {
            manufacturer: { icon: '🏭', label: 'Manufacturer' },
            distributor: { icon: '📦', label: 'Distributor' },
            service_provider: { icon: '🔧', label: 'Service Provider' },
            raw_material: { icon: '⚗️', label: 'Raw Material' },
            component: { icon: '⚙️', label: 'Component' }
        };

        const config = typeConfigs[type as keyof typeof typeConfigs];
        if (!config) return null;

        return (
            <Badge className="text-xs" variant="secondary">
                <span className="mr-1">{config.icon}</span>
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/suppliers')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Suppliers
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{supplierData.name}</h1>
                        <p className="text-muted-foreground">
                            {supplierData.company || 'Supplier Profile'}
                        </p>
                    </div>
                </div>

                {canManage && (
                    <SupplierProfileActions
                        supplier={supplierData}
                        onEdit={() => navigate(`/suppliers/${id}/edit`)}
                        onDelete={() => setIsDeleteModalOpen(true)}
                        onSendRFQ={() => console.log('Send RFQ to:', supplierData.name)}
                        onRequalify={() => console.log('Re-qualify:', supplierData.name)}
                        onExport={() => console.log('Export:', supplierData.name)}
                    />
                )}
            </div>

            {/* Status and Type Badges */}
            <div className="flex items-center gap-2">
                {getStatusBadge(supplierData)}
                {supplierData.supplierType && getSupplierTypeBadge(supplierData.supplierType)}
                {supplierData.expiryDate && (
                    <span className="text-sm text-muted-foreground">
                        Expires: {supplierData.expiryDate}
                    </span>
                )}
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="qualification">Qualification</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Company Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building2 className="w-5 h-5 mr-2" />
                                    Company Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InlineEditField
                                    field="companyName"
                                    value={supplierData.company || supplierData.companyName || supplierData.name}
                                    label="Company Name"
                                    className="text-lg font-medium"
                                />

                                <InlineEditField
                                    field="address"
                                    value={supplierData.address || ''}
                                    label="Address"
                                    placeholder="Enter company address"
                                    icon={MapPin}
                                />

                                <InlineEditField
                                    field="city"
                                    value={supplierData.city || ''}
                                    label="City"
                                    placeholder="Enter city"
                                />

                                <InlineEditField
                                    field="state"
                                    value={supplierData.state || ''}
                                    label="State/Province"
                                    placeholder="Enter state/province"
                                />

                                <InlineEditField
                                    field="country"
                                    value={supplierData.country || ''}
                                    label="Country"
                                    placeholder="Enter country"
                                    icon={MapPin}
                                />

                                <InlineEditField
                                    field="postalCode"
                                    value={supplierData.postalCode || ''}
                                    label="Postal Code"
                                    placeholder="Enter postal code"
                                />

                                <InlineEditField
                                    field="website"
                                    value={supplierData.website || ''}
                                    label="Website"
                                    placeholder="https://www.company.com"
                                    icon={Globe}
                                    href={supplierData.website ? `https://${supplierData.website.replace(/^https?:\/\//, '')}` : undefined}
                                />
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InlineEditField
                                    field="contactName"
                                    value={supplierData.primaryContactName || supplierData.name || ''}
                                    label="Primary Contact"
                                    placeholder="Enter contact name"
                                    className="text-lg font-medium"
                                />

                                <InlineEditField
                                    field="email"
                                    value={supplierData.email || ''}
                                    label="Email"
                                    type="email"
                                    placeholder="contact@company.com"
                                    icon={Mail}
                                    href={supplierData.email ? `mailto:${supplierData.email}` : undefined}
                                />

                                <InlineEditField
                                    field="phone"
                                    value={supplierData.phone || ''}
                                    label="Phone"
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    icon={Phone}
                                    href={supplierData.phone ? `tel:${supplierData.phone}` : undefined}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" />
                                Financial Information
                            </CardTitle>
                            <CardDescription>
                                Financial details and payment terms
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <InlineEditField
                                        field="annualSpend"
                                        value={supplierData.annualSpend ? `$${supplierData.annualSpend.toLocaleString()}` : ''}
                                        label="Annual Spend"
                                        type="number"
                                        placeholder="Enter annual spend amount"
                                        icon={DollarSign}
                                        className="text-lg font-semibold text-green-600"
                                    />

                                    <InlineEditField
                                        field="currency"
                                        value={supplierData.currency || 'USD'}
                                        label="Default Currency"
                                        placeholder="USD"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <InlineEditField
                                        field="paymentTerms"
                                        value={supplierData.paymentTerms || ''}
                                        label="Payment Terms"
                                        placeholder="e.g., Net 30, Net 45"
                                        icon={Calendar}
                                    />

                                    <InlineEditField
                                        field="taxId"
                                        value={supplierData.taxId || ''}
                                        label="Tax ID"
                                        placeholder="Enter tax identification number"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Capabilities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Capabilities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Manufacturing Capabilities</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(supplierData.specialties || supplierData.capabilities || []).map((capability: string, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {getReadableCapabilityName(capability)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                                <Star className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{supplierData.performance?.rating?.toFixed(1) || supplierData.rating?.toFixed(1) || supplierData.performance_rating?.toFixed(1) || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    Based on quality & service
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{supplierData.performance?.responseRate || supplierData.response_rate || 0}%</div>
                                <p className="text-xs text-muted-foreground">
                                    On-time delivery rate
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Turnaround Time</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{supplierData.performance?.turnaroundDays || supplierData.average_turnaround_days || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Average days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                                <Award className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{supplierData.performance?.qualityScore || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    Quality assessment
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {supplierData.performance?.costCompetitiveness && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Cost Competitiveness
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{supplierData.performance.costCompetitiveness}</div>
                                <p className="text-sm text-muted-foreground">
                                    Cost competitiveness score
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Qualification Tab */}
                <TabsContent value="qualification" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualification Status</CardTitle>
                            <CardDescription>
                                Current qualification status and requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    {getStatusBadge(supplierData)}
                                </div>

                                {supplierData.expiryDate && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Expiry Date</span>
                                        <span className="text-sm">{supplierData.expiryDate}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Last Activity</span>
                                    <span className="text-sm">{supplierData.lastActivity || supplierData.last_contact_date || 'No recent activity'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Supplier Documents
                            </CardTitle>
                            <CardDescription>
                                Certificates, qualifications, and other documents organized by type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {documentsLoading ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                                    <p>Loading documents...</p>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
                                    <p className="text-muted-foreground">
                                        Documents will appear here once uploaded
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(() => {
                                        // Group documents by category
                                        const groupedDocs = documents.reduce((acc, doc) => {
                                            const category = doc.category || 'other';
                                            if (!acc[category]) {
                                                acc[category] = [];
                                            }
                                            acc[category].push(doc);
                                            return acc;
                                        }, {} as Record<string, typeof documents>);

                                        // Sort categories alphabetically by readable name
                                        const sortedCategories = Object.keys(groupedDocs).sort((a, b) => {
                                            const readableA = getReadableDocumentCategory(a);
                                            const readableB = getReadableDocumentCategory(b);
                                            return readableA.localeCompare(readableB);
                                        });

                                        return sortedCategories.map((category) => (
                                            <div key={category} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {getReadableDocumentCategory(category)}
                                                    </h3>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {groupedDocs[category].length} document{groupedDocs[category].length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    {groupedDocs[category].map((doc) => (
                                                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center flex-1">
                                                                <FileText className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium truncate">{doc.title}</p>
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                                                        {doc.file_size && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>{Math.round(doc.file_size / 1024)} KB</span>
                                                                            </>
                                                                        )}
                                                                        {doc.uploaded_by_user && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>by {doc.uploaded_by_user.name}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {doc.description && (
                                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                            {doc.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-4">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => downloadDocument(doc)}
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handlePreviewDocument(doc)}
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                {canManage && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => deleteDocument(doc.id)}
                                                                        title="Delete"
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Archive className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>
                                Recent activities and interactions with this supplier
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                                <p className="text-muted-foreground">
                                    Activity history will appear here
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            {isEditModalOpen && (
                <SupplierEditModal
                    supplier={supplierData}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={(updatedSupplier) => {
                        console.log('Updated supplier:', updatedSupplier);
                        fetchSuppliers();
                        setIsEditModalOpen(false);
                    }}
                />
            )}

            {isDeleteModalOpen && (
                <SupplierDeleteModal
                    supplier={supplierData}
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => {
                        console.log('Delete supplier:', supplierData.id);
                        navigate('/suppliers');
                    }}
                />
            )}
        </div>
    );
}
