import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { SupplierEditForm } from "@/components/supplier/SupplierEditForm";
import { SupplierManagementService } from "@/features/supplier-management/services/supplierManagementService";
import { Supplier } from "@/types/supplier";

export function EditSupplierPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSupplier = async () => {
            if (!id) {
                setError("No supplier ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const supplierData = await SupplierManagementService.getSupplierById(id);
                setSupplier(supplierData);
            } catch (err) {
                console.error('Error fetching supplier:', err);
                setError(err instanceof Error ? err.message : 'Failed to load supplier');
            } finally {
                setLoading(false);
            }
        };

        fetchSupplier();
    }, [id]);

    const handleSuccess = async (updatedSupplier: Supplier) => {
        toast({
            title: "Supplier Updated Successfully!",
            description: `Supplier "${updatedSupplier.name || 'Unknown'}" has been updated successfully.`,
        });

        // Navigate back to supplier profile
        navigate(`/suppliers/${id}`);
    };

    const handleCancel = () => {
        navigate(`/suppliers/${id}`);
    };

    const handleRetry = () => {
        if (id) {
            const fetchSupplier = async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const supplierData = await SupplierManagementService.getSupplierById(id);
                    setSupplier(supplierData);
                } catch (err) {
                    console.error('Error fetching supplier:', err);
                    setError(err instanceof Error ? err.message : 'Failed to load supplier');
                } finally {
                    setLoading(false);
                }
            };

            fetchSupplier();
        }
    };

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
                    <div className="flex items-center justify-center space-x-2">
                        <Button onClick={handleRetry}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/suppliers')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Suppliers
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            {/* Back Button */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Supplier</h1>
                <p className="text-muted-foreground">
                    Update supplier information for {supplier.name}
                </p>
            </div>

            {/* Supplier Edit Form */}
            <SupplierEditForm
                supplier={supplier}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
