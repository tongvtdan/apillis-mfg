import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    X,
    Upload,
    History,
    MoreVertical,
    Plus
} from 'lucide-react';
import { useSuppliers } from '@/features/supplier-management/hooks/useSuppliers';
import { usePermissions } from '@/core/auth/hooks/usePermissions';
import { useSupplierDocuments } from '@/hooks/useSupplierDocuments';
import { SupplierProfileActions, SupplierEditModal, SupplierDeleteModal, SupplierDocumentUploadModal } from '@/features/supplier-management';
import { SupplierManagementService } from '@/features/supplier-management/services/supplierManagementService';
import { useAuth } from '@/core/auth';
import { Supplier } from '@/types/supplier';

export function SupplierProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { canManageSuppliers, canViewSuppliers } = usePermissions();
    const { documents, loading: documentsLoading, uploadDocument, deleteDocument, refreshDocuments } = useSupplierDocuments(id || '');

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Supplier>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

    // Load supplier data
    useEffect(() => {
        const loadSupplier = async () => {
            if (!id) {
                setError('No supplier ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const supplierData = await SupplierManagementService.getSupplierById(id);
                setSupplier(supplierData);
            } catch (err) {
                console.error('Error loading supplier:', err);
                setError(err instanceof Error ? err.message : 'Failed to load supplier');
            } finally {
                setLoading(false);
            }
        };

        loadSupplier();
    }, [id]);

    // Permission checks
    useEffect(() => {
        const checkPermissions = async () => {
            if (!user) return;

            try {
                const canManage = await canManageSuppliers();
                const canView = await canViewSuppliers();

                if (!canView) {
                    navigate('/suppliers');
                    toast({
                        title: 'Access Denied',
                        description: 'You do not have permission to view supplier details.',
                        variant: 'destructive'
                    });
                }
            } catch (error) {
                console.error('Permission check failed:', error);
            }
        };

        checkPermissions();
    }, [user, canManageSuppliers, canViewSuppliers, navigate, toast]);

    const handleEdit = () => {
        if (!supplier) return;
        setEditData(supplier);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!supplier || !user) return;

        try {
            const updatedSupplier = await SupplierManagementService.updateSupplier(supplier.id, editData, user.id);
            setSupplier(updatedSupplier);
            setIsEditing(false);
            setEditData({});
            toast({
                title: 'Supplier Updated',
                description: 'Supplier information has been updated successfully.',
            });
        } catch (error) {
            console.error('Error updating supplier:', error);
            toast({
                title: 'Update Failed',
                description: 'Failed to update supplier information.',
                variant: 'destructive'
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleDelete = async () => {
        if (!supplier || !user) return;

        try {
            await SupplierManagementService.deleteSupplier(supplier.id, user.id);
            toast({
                title: 'Supplier Deleted',
                description: 'Supplier has been deleted successfully.',
            });
            navigate('/suppliers');
        } catch (error) {
            console.error('Error deleting supplier:', error);
            toast({
                title: 'Delete Failed',
                description: 'Failed to delete supplier.',
                variant: 'destructive'
            });
        }
    };

    const handleArchive = async () => {
        if (!supplier || !user) return;

        try {
            const updatedSupplier = await SupplierManagementService.updateSupplier(
                supplier.id,
                { is_active: !supplier.is_active },
                user.id
            );
            setSupplier(updatedSupplier);
            toast({
                title: supplier.is_active ? 'Supplier Archived' : 'Supplier Restored',
                description: supplier.is_active
                    ? 'Supplier has been archived.'
                    : 'Supplier has been restored.',
            });
        } catch (error) {
            console.error('Error archiving supplier:', error);
            toast({
                title: 'Archive Failed',
                description: 'Failed to archive supplier.',
                variant: 'destructive'
            });
        }
    };

    const handleDocumentUpload = async (file: File, category: string, description?: string) => {
        if (!id) return;

        try {
            await uploadDocument(file, category, description);
            toast({
                title: 'Document Uploaded',
                description: 'Document has been uploaded successfully.',
            });
        } catch (error) {
            console.error('Error uploading document:', error);
            toast({
                title: 'Upload Failed',
                description: 'Failed to upload document.',
                variant: 'destructive'
            });
        }
    };

    const handleDocumentDelete = async (documentId: string) => {
        try {
            await deleteDocument(documentId);
            toast({
                title: 'Document Deleted',
                description: 'Document has been deleted successfully.',
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: 'Delete Failed',
                description: 'Failed to delete document.',
                variant: 'destructive'
            });
        }
    };

    const handleDocumentDownload = async (documentId: string, filename: string) => {
        try {
            const response = await fetch(`/api/suppliers/${id}/documents/${documentId}/download`);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading document:', error);
            toast({
                title: 'Download Failed',
                description: 'Failed to download document.',
                variant: 'destructive'
            });
        }
    };

    const toggleDocumentSelection = (documentId: string) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedDocuments.length === 0) return;

        try {
            await Promise.all(selectedDocuments.map(id => deleteDocument(id)));
            setSelectedDocuments([]);
            toast({
                title: 'Documents Deleted',
                description: `${selectedDocuments.length} documents have been deleted.`,
            });
        } catch (error) {
            console.error('Error bulk deleting documents:', error);
            toast({
                title: 'Delete Failed',
                description: 'Failed to delete selected documents.',
                variant: 'destructive'
            });
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Supplier</h2>
                    <p className="text-muted-foreground mb-4">{error || 'Supplier not found'}</p>
                    <Button onClick={() => navigate('/suppliers')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Suppliers
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/suppliers')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{supplier.name}</h1>
                        <p className="text-muted-foreground">{supplier.companyName || 'No company name'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                        {supplier.is_active ? 'Active' : 'Archived'}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleArchive}>
                                <Archive className="h-4 w-4 mr-2" />
                                {supplier.is_active ? 'Archive' : 'Restore'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteModal(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Supplier
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">Name</label>
                                                    <Input
                                                        value={editData.name || ''}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Company Name</label>
                                                    <Input
                                                        value={editData.companyName || ''}
                                                        onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">Email</label>
                                                    <Input
                                                        type="email"
                                                        value={editData.email || ''}
                                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Phone</label>
                                                    <Input
                                                        value={editData.phone || ''}
                                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Address</label>
                                                <Input
                                                    value={editData.address || ''}
                                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="outline" onClick={handleCancel}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleSave}>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{supplier.email}</span>
                                            </div>
                                            {supplier.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{supplier.phone}</span>
                                                </div>
                                            )}
                                            {supplier.address && (
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>{supplier.address}</span>
                                                </div>
                                            )}
                                            {supplier.website && (
                                                <div className="flex items-center gap-3">
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                    <a
                                                        href={supplier.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        {supplier.website}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Supplier Type</label>
                                            <p className="text-sm">{supplier.supplierType || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                                            <p className="text-sm">{supplier.status || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Qualification Status</label>
                                            <p className="text-sm">{supplier.qualificationStatus || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Rating</label>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm">{supplier.rating || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Quick Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Projects</span>
                                        <span className="font-medium">{supplier.projectCount || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Response Rate</span>
                                        <span className="font-medium">{supplier.responseRate || 0}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Last Contact</span>
                                        <span className="font-medium">
                                            {supplier.lastContactDate
                                                ? new Date(supplier.lastContactDate).toLocaleDateString()
                                                : 'Never'
                                            }
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => setShowUploadModal(true)}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => navigate(`/suppliers/${id}/edit`)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Supplier
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => navigate(`/rfq/new?supplier=${id}`)}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send RFQ
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Documents
                                    </CardTitle>
                                    <CardDescription>
                                        Manage supplier documents and certifications
                                    </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-64"
                                    />
                                    <Button onClick={() => setShowUploadModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                    {selectedDocuments.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            onClick={handleBulkDelete}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete ({selectedDocuments.length})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {documentsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-2">Loading documents...</p>
                                </div>
                            ) : filteredDocuments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No documents found</p>
                                    <p className="text-sm">Upload documents to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredDocuments.map((doc) => (
                                        <Card key={doc.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocuments.includes(doc.id)}
                                                        onChange={() => toggleDocumentSelection(doc.id)}
                                                        className="rounded"
                                                    />
                                                    <div>
                                                        <h4 className="font-medium">{doc.filename}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                        {doc.description && (
                                                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDocumentDownload(doc.id, doc.filename)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDocumentDelete(doc.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Activity History
                            </CardTitle>
                            <CardDescription>
                                Recent activity and changes for this supplier
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Activity history coming soon...</p>
                                <p className="text-sm">Track supplier interactions and changes</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Performance Metrics
                            </CardTitle>
                            <CardDescription>
                                Supplier performance and quality metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Performance tracking coming soon...</p>
                                <p className="text-sm">Monitor supplier quality, delivery, and responsiveness</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <SupplierEditModal
                supplier={supplier}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={(updatedSupplier) => {
                    setSupplier(updatedSupplier);
                    setShowEditModal(false);
                }}
            />

            <SupplierDeleteModal
                supplier={supplier}
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />

            <SupplierDocumentUploadModal
                supplierId={id || ''}
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleDocumentUpload}
            />
        </div>
    );
}
