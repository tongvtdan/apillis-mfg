import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Users,
    TrendingUp,
    Star,
    Plus,
    BarChart3,
    Clock,
    CheckCircle
} from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { SupplierTable } from '@/components/supplier/SupplierTable';
import { SupplierModal } from '@/components/supplier/SupplierModal';
import { Supplier } from '@/types/supplier';

export default function Suppliers() {
    const { suppliers, loading } = useSuppliers();
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    // Calculate supplier statistics
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.is_active).length;
    const averageRating = suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length
        : 0;
    const averageResponseRate = suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + s.response_rate, 0) / suppliers.length
        : 0;

    const handleSupplierSelect = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        // Could navigate to supplier detail page or show details panel
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
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
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </Button>
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
                            {activeSuppliers} active suppliers
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
                                ? (suppliers.reduce((sum, s) => sum + s.average_turnaround_days, 0) / suppliers.length).toFixed(1)
                                : '0.0'
                            }d
                        </div>
                        <p className="text-xs text-base-content/70">
                            Average response time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="suppliers" className="w-full">
                <TabsList>
                    <TabsTrigger value="suppliers">All Suppliers</TabsTrigger>
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
                            />
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