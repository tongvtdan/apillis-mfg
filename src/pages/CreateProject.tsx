import React from "react";
import { useNavigate } from "react-router-dom";
import { ProjectIntakePortal } from "@/components/project/ProjectIntakePortal";
import { useToast } from "@/hooks/use-toast";

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
            <ProjectIntakePortal onSuccess={handleSuccess} />
        </div>
    );
}
