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
import { SupplierList } from '@/features/supplier-management';

export function SuppliersPage() {
    const [showArchived, setShowArchived] = useState(false);
    const { suppliers, loading } = useSuppliers(showArchived);
    const { canManageSuppliers } = usePermissions();
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
        ? suppliers.reduce((sum, s) => sum + (s.performance?.rating || 0), 0) / suppliers.length
        : 0;
    const averageResponseRate = suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + (s.performance?.responseRate || 0), 0) / suppliers.length
        : 0;

    // Calculate qualification statistics
    const qualifiedSuppliers = suppliers.filter(s => s.status === 'qualified').length;
    const pendingSuppliers = suppliers.filter(s => s.status === 'in_progress').length;
    const rejectedSuppliers = suppliers.filter(s => s.status === 'not_qualified').length;

    const handleCreateSupplier = () => {
        navigate('/suppliers/create');
    };

    const handleSupplierClick = (supplierId: string) => {
        navigate(`/suppliers/${supplierId}`);
    };

    const handleEditSupplier = (supplierId: string) => {
        navigate(`/suppliers/${supplierId}/edit`);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Suppliers</h1>
                    <p className="text-muted-foreground">
                        Manage your supplier network and track performance
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreateSupplier}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Supplier
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSuppliers}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeSuppliers} active, {archivedSuppliers} archived
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on {suppliers.length} suppliers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageResponseRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Average response time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{qualifiedSuppliers}</div>
                        <p className="text-xs text-muted-foreground">
                            {pendingSuppliers} pending, {rejectedSuppliers} rejected
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Controls */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Supplier Directory</CardTitle>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="show-archived"
                                    checked={showArchived}
                                    onCheckedChange={setShowArchived}
                                />
                                <Label htmlFor="show-archived">Show Archived</Label>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <SupplierList
                        suppliers={suppliers}
                        loading={loading}
                        onSupplierClick={handleSupplierClick}
                        onEditSupplier={handleEditSupplier}
                        showArchived={showArchived}
                    />
                </CardContent>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Supplier Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['manufacturer', 'distributor', 'service_provider', 'raw_material', 'component'].map((type) => {
                                const count = suppliers.filter(s => s.supplierType === type).length;
                                const percentage = totalSuppliers > 0 ? (count / totalSuppliers) * 100 : 0;

                                return (
                                    <div key={type} className="flex items-center justify-between">
                                        <span className="text-sm capitalize">
                                            {type.replace('_', ' ')}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-secondary rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Qualification Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { status: 'qualified', label: 'Qualified', color: 'bg-green-500' },
                                { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
                                { status: 'not_qualified', label: 'Not Qualified', color: 'bg-gray-500' },
                                { status: 'expiring_soon', label: 'Expiring Soon', color: 'bg-orange-500' }
                            ].map(({ status, label, color }) => {
                                const count = suppliers.filter(s => s.status === status).length;
                                const percentage = totalSuppliers > 0 ? (count / totalSuppliers) * 100 : 0;

                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="text-sm">{label}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-secondary rounded-full h-2">
                                                <div
                                                    className={`${color} h-2 rounded-full`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>
                        Latest supplier updates and activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Recent activity tracking coming soon...</p>
                        <p className="text-sm">Monitor supplier interactions and updates</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
