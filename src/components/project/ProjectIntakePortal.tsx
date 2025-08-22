import { useState } from "react";
import { ProjectIntakeForm } from "./ProjectIntakeForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Lightbulb } from "lucide-react";

interface ProjectIntakePortalProps {
  onSuccess?: (projectId: string) => void;
}

export function ProjectIntakePortal({ onSuccess }: ProjectIntakePortalProps) {
  const [activeTab, setActiveTab] = useState("rfq");

  const handleFormSuccess = (projectId: string) => {
    console.log('Project submitted successfully:', projectId);
    onSuccess?.(projectId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Submit Your Project</h1>
        <p className="text-muted-foreground">
          Get started with your manufacturing project - whether it's an RFQ, purchase order, or just an idea
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rfq" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            RFQ / Quote Request
          </TabsTrigger>
          <TabsTrigger value="po" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Purchase Order
          </TabsTrigger>
          <TabsTrigger value="idea" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Project Idea
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rfq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request for Quotation</CardTitle>
              <CardDescription>
                Submit detailed specifications and drawings to get an accurate quote for your manufacturing project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectIntakeForm 
                submissionType="RFQ"
                onSuccess={handleFormSuccess} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="po" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order</CardTitle>
              <CardDescription>
                Already have specifications? Upload your purchase order and supporting documents to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectIntakeForm 
                submissionType="Purchase Order"
                onSuccess={handleFormSuccess} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="idea" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Idea</CardTitle>
              <CardDescription>
                Have a concept or idea? Share your vision and we'll help develop it into a manufacturable product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectIntakeForm 
                submissionType="Project Idea"
                onSuccess={handleFormSuccess} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Legacy compatibility
export const RFQIntakePortal = ProjectIntakePortal;