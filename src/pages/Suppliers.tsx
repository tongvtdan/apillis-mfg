import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    AlertTriangle
} from 'lucide-react';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';
import { usePermissions } from '@/core/auth/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { Supplier } from '@/types/supplier';
import { SupplierList } from '@/components/supplier/SupplierList';

export default function Suppliers() {
    const [showArchived, setShowArchived] = useState(false);
    const { suppliers, loading } = useSuppliers(showArchived);
    const { canManageSuppliers } = usePermissions(); // Use the hook function directly
    const navigate = useNavigate();

    // Check permissions on component mount
    useEffect(() => {
        const checkPermissions = async () => {
            const canManage = await canManageSuppliers();
        };
        checkPermissions();
    }, [canManageSuppliers]);

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

    const handleSupplierSelect = (supplier: any) => {
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

    const handleAddSupplier = () => {
        navigate('/suppliers/new');
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
                        <Button
                            onClick={handleAddSupplier}
                            variant="accent"
                            className="action-button shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Supplier
                        </Button>
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

            {/* Main Content - Screen 1 View Only */}
            <Card>
                <CardHeader>
                    <CardTitle>Supplier Directory</CardTitle>
                    <CardDescription>
                        View and manage your suppliers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SupplierList
                        onSupplierSelect={handleSupplierSelect}
                        onSendRFQ={handleSendRFQ}
                        onStartQualification={handleStartQualification}
                    />
                </CardContent>
            </Card>
        </div>
    );
}