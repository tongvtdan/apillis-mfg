import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Archive
} from 'lucide-react';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';
import { usePermissions } from '@/core/auth/hooks/usePermissions';
import { SupplierProfileActions } from '@/components/supplier/SupplierProfileActions';
import { SupplierEditModal } from '@/components/supplier/SupplierEditModal';
import { SupplierDeleteModal } from '@/components/supplier/SupplierDeleteModal';

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
    const { suppliers, loading, refreshSuppliers } = useSuppliers();
    const { canManageSuppliers } = usePermissions();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [canManage, setCanManage] = useState(false);

    // Find the supplier by ID - check both real data and mock data
    const supplier = suppliers.find(s => s.id === id) || MOCK_SUPPLIERS.find(s => s.id === id);

    useEffect(() => {
        const checkPermissions = async () => {
            const canManageResult = await canManageSuppliers();
            setCanManage(canManageResult);
        };
        checkPermissions();
    }, [canManageSuppliers]);

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

    if (!supplier) {
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
                        <h1 className="text-3xl font-bold">{supplier.name}</h1>
                        <p className="text-muted-foreground">
                            {supplier.company || 'Supplier Profile'}
                        </p>
                    </div>
                </div>

                {canManage && (
                    <SupplierProfileActions
                        supplier={supplier}
                        onEdit={() => navigate(`/suppliers/${id}/edit`)}
                        onDelete={() => setIsDeleteModalOpen(true)}
                        onSendRFQ={() => console.log('Send RFQ to:', supplier.name)}
                        onRequalify={() => console.log('Re-qualify:', supplier.name)}
                        onExport={() => console.log('Export:', supplier.name)}
                    />
                )}
            </div>

            {/* Status and Type Badges */}
            <div className="flex items-center gap-2">
                {getStatusBadge(supplier)}
                {supplier.supplierType && getSupplierTypeBadge(supplier.supplierType)}
                {supplier.expiryDate && (
                    <span className="text-sm text-muted-foreground">
                        Expires: {supplier.expiryDate}
                    </span>
                )}
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="qualification">Qualification</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
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
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                    <p className="text-lg">{supplier.company || supplier.companyName || supplier.name}</p>
                                </div>

                                {supplier.country && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <span>{supplier.country}</span>
                                        </div>
                                    </div>
                                )}

                                {supplier.website && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                                        <div className="flex items-center">
                                            <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <a
                                                href={supplier.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {supplier.website}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {supplier.annualSpend !== undefined && supplier.annualSpend > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Annual Spend</label>
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <span>${supplier.annualSpend.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {supplier.paymentTerms && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <span>{supplier.paymentTerms}</span>
                                        </div>
                                    </div>
                                )}
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
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
                                    <p className="text-lg">{supplier.name}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <a
                                            href={`mailto:${supplier.email}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {supplier.email}
                                        </a>
                                    </div>
                                </div>

                                {supplier.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <a
                                                href={`tel:${supplier.phone}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {supplier.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Capabilities and Specialties */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Capabilities & Specialties
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Specialties</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(supplier.specialties || supplier.capabilities || []).map((specialty: string, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {specialty}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {supplier.capabilities && supplier.capabilities.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Capabilities</label>
                                        <div className="flex flex-wrap gap-2">
                                            {supplier.capabilities.map((capability, index) => (
                                                <Badge key={index} variant="outline">
                                                    {capability}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                <div className="text-2xl font-bold">{supplier.performance?.rating?.toFixed(1) || supplier.rating?.toFixed(1) || supplier.performance_rating?.toFixed(1) || 'N/A'}</div>
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
                                <div className="text-2xl font-bold">{supplier.performance?.responseRate || supplier.response_rate || 0}%</div>
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
                                <div className="text-2xl font-bold">{supplier.performance?.turnaroundDays || supplier.average_turnaround_days || 0}</div>
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
                                <div className="text-2xl font-bold">{supplier.performance?.qualityScore || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    Quality assessment
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {supplier.performance?.costCompetitiveness && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Cost Competitiveness
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{supplier.performance.costCompetitiveness}</div>
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
                                    {getStatusBadge(supplier)}
                                </div>

                                {supplier.expiryDate && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Expiry Date</span>
                                        <span className="text-sm">{supplier.expiryDate}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Last Activity</span>
                                    <span className="text-sm">{supplier.lastActivity || supplier.last_contact_date || 'No recent activity'}</span>
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
                                Certificates, qualifications, and other documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
                                <p className="text-muted-foreground">
                                    Documents will appear here once uploaded
                                </p>
                            </div>
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
                    supplier={supplier}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={(updatedSupplier) => {
                        console.log('Updated supplier:', updatedSupplier);
                        refreshSuppliers();
                        setIsEditModalOpen(false);
                    }}
                />
            )}

            {isDeleteModalOpen && (
                <SupplierDeleteModal
                    supplier={supplier}
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => {
                        console.log('Delete supplier:', supplier.id);
                        navigate('/suppliers');
                    }}
                />
            )}
        </div>
    );
}
