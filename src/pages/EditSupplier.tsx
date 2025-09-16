import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { SupplierEditForm } from "@/components/supplier/SupplierEditForm";
import { SupplierManagementService } from "@/features/supplier-management/services/supplierManagementService";
import { Supplier } from "@/types/supplier";

export default function EditSupplier() {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading supplier information...</p>
                </div>
            </div>
        );
    }

    if (error || !supplier) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Supplier</h2>
                    <p className="text-muted-foreground mb-4">
                        {error || "The supplier you're trying to edit doesn't exist or has been removed."}
                    </p>
                    <Button onClick={() => navigate('/suppliers')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Suppliers
                    </Button>
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
                    onClick={() => navigate(`/suppliers/${id}`)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Supplier Profile
                </Button>
            </div>

            <SupplierEditForm
                supplier={supplier}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
