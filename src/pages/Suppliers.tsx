import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Building2,
    Users,
    TrendingUp,
    Star,
    Plus,
    BarChart3,
    Clock,
    CheckCircle,
    Award,
    AlertTriangle,
    LayoutGrid,
    Table
} from 'lucide-react';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';
import { usePermissions } from '@/core/auth/hooks/usePermissions';
import { SupplierTable } from '@/components/supplier/SupplierTable';
import { SupplierModal } from '@/components/supplier/SupplierModal';
import { Supplier } from '@/types/supplier';
import { SupplierList } from '@/components/supplier/SupplierList';

export default function Suppliers() {
    const [showArchived, setShowArchived] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'screen1'>('table');
    const { suppliers, loading } = useSuppliers(showArchived);
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [canManageSuppliers, setCanManageSuppliers] = useState(false);

    const {
        canManageSuppliers: checkCanManageSuppliers
    } = usePermissions();

    // Check permissions on component mount
    useEffect(() => {
        const checkPermissions = async () => {
            const canManage = await checkCanManageSuppliers();
            setCanManageSuppliers(canManage);
        };
        checkPermissions();
    }, [checkCanManageSuppliers]);

    // Calculate supplier statistics
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.is_active).length;
    const archivedSuppliers = suppliers.filter(s => !s.is_active).length;
    const averageRating = suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length
        : 0;
    const averageResponseRate = suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + (s.response_rate || 0), 0) / suppliers.length
        : 0;

    // Calculate qualification statistics (mock data for now)
    const qualifiedSuppliers = suppliers.filter(s =>
        s.is_active
    ).length;
    const pendingQualificationSuppliers = 0;
    const rejectedSuppliers = 0;

    const handleSupplierSelect = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        // Could navigate to supplier detail page or show details panel
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
    };

    const handleSupplierSelectScreen1 = (supplier: any) => {
        console.log('View supplier:', supplier);
        alert(`Viewing supplier: ${supplier.name}`);
    };

    const handleSendRFQ = (supplier: any) => {
        console.log('Send RFQ to supplier:', supplier);
        alert(`Sending RFQ to: ${supplier.name}`);
    };

    const handleStartQualification = (supplier: any) => {
        console.log('Start qualification for supplier:', supplier);
        alert(`Starting qualification for: ${supplier.name}`);
    };

    if (loading) {
        return (
            <div className="p-6 bg-base-100 text-base-content min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-base-content">Supplier Management</h1>
                    <p className="text-base-content/70">Manage your supplier network and performance</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-muted rounded-lg h-24"></div>
                        </div>
                    ))}
                </div>
                <div className="animate-pulse">
                    <div className="bg-muted rounded-lg h-96"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-base-100 text-base-content min-h-screen">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-base-content">Supplier Management</h1>
                        <p className="text-base-content/70">Manage your supplier network and performance</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-archived-suppliers"
                                checked={showArchived}
                                onCheckedChange={setShowArchived}
                            />
                            <Label htmlFor="show-archived-suppliers" className="text-sm">
                                Show Archived
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                            >
                                <Table className="w-4 h-4 mr-2" />
                                Table View
                            </Button>
                            <Button
                                variant={viewMode === 'screen1' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('screen1')}
                            >
                                <LayoutGrid className="w-4 h-4 mr-2" />
                                Screen 1 View
                            </Button>
                        </div>
                        {canManageSuppliers && (
                            <Button
                                onClick={() => setShowModal(true)}
                                variant="accent"
                                className="action-button shadow-md hover:shadow-lg"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Supplier
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                        <Users className="h-4 w-4 text-base-content/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-base-content">{totalSuppliers}</div>
                        <p className="text-xs text-base-content/70">
                            {showArchived ? 'Archived suppliers' : `${activeSuppliers} active suppliers`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-base-content/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-base-content">{averageRating.toFixed(1)}</div>
                        <p className="text-xs text-base-content/70">
                            Out of 5.0 stars
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-base-content/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-base-content">{averageResponseRate.toFixed(1)}%</div>
                        <p className="text-xs text-base-content/70">
                            Average response rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
                        <Clock className="h-4 w-4 text-base-content/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-base-content">
                            {suppliers.length > 0
                                ? (suppliers.reduce((sum, s) => sum + (s.average_turnaround_days || 0), 0) / suppliers.length).toFixed(1)
                                : '0.0'
                            }d
                        </div>
                        <p className="text-xs text-base-content/70">
                            Average response time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Qualification Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Qualified Suppliers</CardTitle>
                        <Award className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{qualifiedSuppliers}</div>
                        <p className="text-xs text-base-content/70">
                            Fully qualified suppliers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Qualification</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingQualificationSuppliers}</div>
                        <p className="text-xs text-base-content/70">
                            In qualification process
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected Suppliers</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedSuppliers}</div>
                        <p className="text-xs text-base-content/70">
                            Failed qualification
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            {viewMode === 'table' ? (
                <Tabs defaultValue="suppliers" className="w-full">
                    <TabsList>
                        <TabsTrigger value="suppliers">All Suppliers</TabsTrigger>
                        <TabsTrigger value="qualification">Qualification</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="suppliers" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Database</CardTitle>
                                <CardDescription>
                                    Manage your supplier network and capabilities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SupplierTable
                                    suppliers={suppliers}
                                    onSupplierSelect={handleSupplierSelect}
                                    onSupplierEdit={handleEdit}
                                    canArchive={canManageSuppliers}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="qualification" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Award className="w-5 h-5 mr-2" />
                                    Supplier Qualification
                                </CardTitle>
                                <CardDescription>
                                    Manage supplier qualification process and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Award className="w-12 h-12 mx-auto text-base-content/70 mb-4" />
                                    <h3 className="text-lg font-medium mb-2 text-base-content">Qualification Management</h3>
                                    <p className="text-base-content/70 mb-4">
                                        Track and manage supplier qualification status, approve suppliers, and handle exceptions.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-2">Qualified Suppliers</h4>
                                            <p className="text-3xl font-bold text-green-600">{qualifiedSuppliers}</p>
                                            <p className="text-sm text-muted-foreground">Ready for RFQs</p>
                                        </div>
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-2">Pending Approval</h4>
                                            <p className="text-3xl font-bold text-yellow-600">{pendingQualificationSuppliers}</p>
                                            <p className="text-sm text-muted-foreground">Awaiting review</p>
                                        </div>
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-2">Expiring Soon</h4>
                                            <p className="text-3xl font-bold text-orange-600">3</p>
                                            <p className="text-sm text-muted-foreground">Re-qualification needed</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Supplier Performance
                                </CardTitle>
                                <CardDescription>
                                    Track supplier performance metrics and KPIs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <TrendingUp className="w-12 h-12 mx-auto text-base-content/70 mb-4" />
                                    <h3 className="text-lg font-medium mb-2 text-base-content">Performance Tracking Coming Soon</h3>
                                    <p className="text-base-content/70">
                                        Detailed supplier performance metrics will be available here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Supplier Analytics
                                </CardTitle>
                                <CardDescription>
                                    Supplier insights and performance analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <BarChart3 className="w-12 h-12 mx-auto text-base-content/70 mb-4" />
                                    <h3 className="text-lg font-medium mb-2 text-base-content">Analytics Coming Soon</h3>
                                    <p className="text-base-content/70">
                                        Supplier analytics and insights will be available here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Directory</CardTitle>
                        <CardDescription>
                            View and manage your suppliers using the Screen 1 design
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SupplierList
                            onSupplierSelect={handleSupplierSelectScreen1}
                            onSendRFQ={handleSendRFQ}
                            onStartQualification={handleStartQualification}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Supplier Modal */}
            <SupplierModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedSupplier(null);
                }}
                onSubmit={(supplierData) => {
                    console.log('Supplier submitted:', supplierData);
                    setShowModal(false);
                    setSelectedSupplier(null);
                }}
                supplier={selectedSupplier}
            />
        </div>
    );
}