import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SupplierIntakeForm } from "@/components/supplier";
import { SupplierManagementService } from "@/features/supplier-management/services/supplierManagementService";

export default function CreateSupplier() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSuccess = async (supplierId: string) => {
        try {
            // Fetch the supplier details to get the name
            const supplier = await SupplierManagementService.getSupplierById(supplierId);
            toast({
                title: "Supplier Created Successfully!",
                description: `New supplier "${supplier.name || 'Unknown'}" has been created successfully.`,
            });
        } catch (error) {
            console.error('Error fetching supplier for toast:', error);
            // Fallback if we can't fetch the supplier details
            toast({
                title: "Supplier Created Successfully!",
                description: `New supplier has been created successfully.`,
            });
        }

        // Navigate back to suppliers list
        navigate("/suppliers");
    };

    const handleCancel = () => {
        navigate("/suppliers");
    };

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

            <SupplierIntakeForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
    );
}