import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/core/auth';
import {
    Users,
    Plus,
    Search,
    Filter,
    Star,
    TrendingUp,
    FileText,
    Send,
    Eye,
    Edit,
    Trash2,
    Download,
    Award,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import {
    Supplier,
    RFQ,
    SUPPLIER_STATUS_CONFIG,
    SUPPLIER_TYPE_CONFIG,
    QUALIFICATION_STATUS_CONFIG,
    RFQ_STATUS_CONFIG,
    supplierSchema,
    rfqSchema
} from '../types/supplier-management.types';
import { SupplierManagementService } from '../services/supplierManagementService';

interface SupplierManagementProps {
    projectId?: string;
    projectTitle?: string;
    onSupplierSelect?: (supplier: Supplier) => void;
    onRFQCreate?: (rfq: RFQ) => void;
}

export function SupplierManagement({
    projectId,
    projectTitle,
    onSupplierSelect,
    onRFQCreate
}: SupplierManagementProps) {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState('suppliers');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

    // Supplier form
    const supplierForm = useForm<Supplier>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            supplierType: 'manufacturer',
            status: 'pending_approval',
            qualificationStatus: 'not_qualified',
            email: '',
            address: '',
            city: '',
            country: 'USA',
            capabilities: [],
            certifications: [],
            qualityStandards: []
        }
    });

    // RFQ form
    const rfqForm = useForm<RFQ>({
        resolver: zodResolver(rfqSchema),
        defaultValues: {
            title: '',
            description: '',
            projectId: projectId || '',
            items: [{ description: '', quantity: 1, unit: 'pcs', specifications: [] }],
            suppliers: [],
            status: 'draft',
            dueDate: '',
            priority: 'normal',
            requirements: []
        }
    });

    const rfqItemsField = useFieldArray({
        control: rfqForm.control,
        name: 'items'
    });

    // Load initial data
    useEffect(() => {
        loadSuppliers();
        if (projectId) {
            loadProjectRFQs();
        }
    }, [profile?.organization_id, projectId]);

    const loadSuppliers = async () => {
        if (!profile?.organization_id) return;

        setLoading(true);
        try {
            const result = await SupplierManagementService.searchSuppliers({}, profile.organization_id);
            setSuppliers(result.suppliers);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProjectRFQs = async () => {
        if (!projectId) return;

        try {
            const projectRfqs = await SupplierManagementService.getProjectRFQs(projectId);
            setRfqs(projectRfqs);
        } catch (error) {
            console.error('Failed to load RFQs:', error);
        }
    };

    const handleCreateSupplier = async (data: Supplier) => {
        if (!user?.id) return;

        try {
            await SupplierManagementService.createSupplier(data, user.id);
            supplierForm.reset();
            loadSuppliers();
            alert('Supplier created successfully!');
        } catch (error) {
            console.error('Failed to create supplier:', error);
            alert('Failed to create supplier');
        }
    };

    const handleCreateRFQ = async (data: RFQ) => {
        if (!user?.id) return;

        try {
            const rfq = await SupplierManagementService.createRFQ(data, user.id);
            rfqForm.reset();
            loadProjectRFQs();
            onRFQCreate?.(rfq);
            alert('RFQ created successfully!');
        } catch (error) {
            console.error('Failed to create RFQ:', error);
            alert('Failed to create RFQ');
        }
    };

    const handleSendRFQ = async (rfqId: string) => {
        if (!user?.id) return;

        try {
            await SupplierManagementService.sendRFQ(rfqId, user.id);
            loadProjectRFQs();
            alert('RFQ sent to suppliers!');
        } catch (error) {
            console.error('Failed to send RFQ:', error);
            alert('Failed to send RFQ');
        }
    };

    const handleSupplierSelect = (supplierId: string) => {
        setSelectedSuppliers(prev =>
            prev.includes(supplierId)
                ? prev.filter(id => id !== supplierId)
                : [...prev, supplierId]
        );
    };

    const addRFQItem = () => {
        rfqItemsField.append({
            description: '',
            quantity: 1,
            unit: 'pcs',
            specifications: []
        });
    };

    const removeRFQItem = (index: number) => {
        if (rfqItemsField.fields.length > 1) {
            rfqItemsField.remove(index);
        }
    };

    const exportSuppliers = () => {
        const exportData = SupplierManagementService.exportSupplierData(suppliers);

        // Download CSV
        const csvBlob = new Blob([exportData.csv], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = 'suppliers.csv';
        csvLink.click();

        // Download JSON
        const jsonBlob = new Blob([exportData.json], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = 'suppliers.json';
        jsonLink.click();

        URL.revokeObjectURL(csvUrl);
        URL.revokeObjectURL(jsonUrl);
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <Users className="h-6 w-6" />
                                <span>Supplier Management</span>
                            </CardTitle>
                            {projectTitle && (
                                <p className="text-muted-foreground mt-1">
                                    Project: {projectTitle}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={exportSuppliers}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                    <TabsTrigger value="rfq">RFQ Management</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                {/* Suppliers Tab */}
                <TabsContent value="suppliers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Supplier List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Supplier Directory</span>
                                    <div className="flex space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search suppliers..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 w-48"
                                            />
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-2">Loading suppliers...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {filteredSuppliers.map((supplier) => (
                                            <Card key={supplier.id} className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium">{supplier.name}</h4>
                                                            <Badge className={SUPPLIER_TYPE_CONFIG[supplier.supplierType].color}>
                                                                {SUPPLIER_TYPE_CONFIG[supplier.supplierType].icon}
                                                                {SUPPLIER_TYPE_CONFIG[supplier.supplierType].label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge className={SUPPLIER_STATUS_CONFIG[supplier.status].color}>
                                                                {SUPPLIER_STATUS_CONFIG[supplier.status].label}
                                                            </Badge>
                                                            <Badge className={QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus].color}>
                                                                {QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus].label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {supplier.qualityRating && (
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 text-yellow-500" />
                                                                <span className="text-sm">{supplier.qualityRating}</span>
                                                            </div>
                                                        )}
                                                        {projectId && (
                                                            <Checkbox
                                                                checked={selectedSuppliers.includes(supplier.id)}
                                                                onCheckedChange={() => handleSupplierSelect(supplier.id)}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Create Supplier */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Supplier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={supplierForm.handleSubmit(handleCreateSupplier)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-name">Supplier Name *</Label>
                                            <Input
                                                id="supplier-name"
                                                {...supplierForm.register('name')}
                                                placeholder="ABC Manufacturing"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-type">Type *</Label>
                                            <Select
                                                value={supplierForm.watch('supplierType')}
                                                onValueChange={(value) => supplierForm.setValue('supplierType', value as any)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(SUPPLIER_TYPE_CONFIG).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center space-x-2">
                                                                <span>{config.icon}</span>
                                                                <span>{config.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-email">Email *</Label>
                                            <Input
                                                id="supplier-email"
                                                type="email"
                                                {...supplierForm.register('email')}
                                                placeholder="contact@supplier.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-phone">Phone</Label>
                                            <Input
                                                id="supplier-phone"
                                                {...supplierForm.register('phone')}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-city">City *</Label>
                                            <Input
                                                id="supplier-city"
                                                {...supplierForm.register('city')}
                                                placeholder="Springfield"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-country">Country *</Label>
                                            <Input
                                                id="supplier-country"
                                                {...supplierForm.register('country')}
                                                placeholder="USA"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supplier-address">Address *</Label>
                                        <Textarea
                                            id="supplier-address"
                                            {...supplierForm.register('address')}
                                            placeholder="123 Main Street"
                                            rows={2}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Supplier
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* RFQ Management Tab */}
                <TabsContent value="rfq" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* RFQ List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Request for Quotes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {rfqs.map((rfq) => (
                                        <Card key={rfq.id} className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">{rfq.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {rfq.items.length} items • {rfq.suppliers.length} suppliers
                                                    </p>
                                                    <Badge className={RFQ_STATUS_CONFIG[rfq.status].color}>
                                                        {RFQ_STATUS_CONFIG[rfq.status].label}
                                                    </Badge>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {rfq.status === 'draft' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSendRFQ(rfq.id)}
                                                        >
                                                            <Send className="h-4 w-4 mr-1" />
                                                            Send
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create RFQ */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create RFQ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={rfqForm.handleSubmit(handleCreateRFQ)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rfq-title">RFQ Title *</Label>
                                        <Input
                                            id="rfq-title"
                                            {...rfqForm.register('title')}
                                            placeholder="Custom Parts RFQ"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rfq-description">Description</Label>
                                        <Textarea
                                            id="rfq-description"
                                            {...rfqForm.register('description')}
                                            placeholder="Detailed RFQ description..."
                                            rows={3}
                                        />
                                    </div>

                                    {/* RFQ Items */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Items</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addRFQItem}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Item
                                            </Button>
                                        </div>

                                        {rfqItemsField.fields.map((field, index) => (
                                            <Card key={field.id} className="p-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Description *</Label>
                                                        <Input
                                                            {...rfqForm.register(`items.${index}.description`)}
                                                            placeholder="Item description"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="space-y-2 flex-1">
                                                            <Label>Quantity *</Label>
                                                            <Input
                                                                type="number"
                                                                {...rfqForm.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2 flex-1">
                                                            <Label>Unit</Label>
                                                            <Input
                                                                {...rfqForm.register(`items.${index}.unit`)}
                                                                placeholder="pcs"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeRFQItem(index)}
                                                            disabled={rfqItemsField.fields.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Supplier Selection */}
                                    {selectedSuppliers.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Selected Suppliers ({selectedSuppliers.length})</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSuppliers.map((supplierId) => {
                                                    const supplier = suppliers.find(s => s.id === supplierId);
                                                    return (
                                                        <Badge key={supplierId} variant="secondary">
                                                            {supplier?.name}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="due-date">Due Date *</Label>
                                            <Input
                                                id="due-date"
                                                type="date"
                                                {...rfqForm.register('dueDate')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={rfqForm.watch('priority')}
                                                onValueChange={(value) => rfqForm.setValue('priority', value as any)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Create RFQ
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5" />
                                <span>Supplier Performance</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Performance tracking coming soon...</p>
                                <p className="text-sm">Monitor supplier quality, delivery, and responsiveness metrics</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
