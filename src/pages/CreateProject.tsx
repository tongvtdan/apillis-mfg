import React from "react";
import { useNavigate } from "react-router-dom";
import { ProjectIntakePortal } from "@/components/project/intake";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateProject() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSuccess = (projectId: string) => {
        toast({
            title: "Project Created Successfully!",
            description: `New project has been created with ID: ${projectId}`,
        });

        // Navigate back to projects list
        navigate("/projects");
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

            <ProjectIntakePortal onSuccess={handleSuccess} />
        </div>
    );
}
