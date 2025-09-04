import { useState, useEffect } from "react";
import { SimplifiedIntakeForm } from "./SimplifiedIntakeForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Lightbulb } from "lucide-react";

interface ProjectIntakePortalProps {
  onSuccess?: (projectId: string) => void;
}

export function ProjectIntakePortal({ onSuccess }: ProjectIntakePortalProps) {
  const [activeTab, setActiveTab] = useState("rfq");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full project-intake-tabs">
        <TabsList
          className="grid w-full grid-cols-3 mb-4"
          style={{
            backgroundColor: isDarkMode ? 'rgba(58, 58, 58, 0.7)' : 'rgba(187, 134, 252, 0.1)',
            padding: '0.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 215, 64, 0.1)',
          }}
        >
          <TabsTrigger
            value="rfq"
            className="flex items-center gap-2"
            style={{
              backgroundColor: activeTab === 'rfq'
                ? isDarkMode ? 'rgba(255, 215, 64, 0.7)' : '#FFD740'
                : 'transparent',
              color: activeTab === 'rfq' ? '#1F2937' : undefined,
              boxShadow: activeTab === 'rfq'
                ? isDarkMode ? '0 0 8px rgba(255, 215, 64, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                : 'none',
              fontWeight: activeTab === 'rfq' ? 600 : 400,
            }}
          >
            <MessageSquare className="h-4 w-4" />
            RFQ / Quote Request
          </TabsTrigger>
          <TabsTrigger
            value="po"
            className="flex items-center gap-2"
            style={{
              backgroundColor: activeTab === 'po'
                ? isDarkMode ? 'rgba(255, 215, 64, 0.7)' : '#FFD740'
                : 'transparent',
              color: activeTab === 'po' ? '#1F2937' : undefined,
              boxShadow: activeTab === 'po'
                ? isDarkMode ? '0 0 8px rgba(255, 215, 64, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                : 'none',
              fontWeight: activeTab === 'po' ? 600 : 400,
            }}
          >
            <FileText className="h-4 w-4" />
            Purchase Order
          </TabsTrigger>
          <TabsTrigger
            value="idea"
            className="flex items-center gap-2"
            style={{
              backgroundColor: activeTab === 'idea'
                ? isDarkMode ? 'rgba(255, 215, 64, 0.7)' : '#FFD740'
                : 'transparent',
              color: activeTab === 'idea' ? '#1F2937' : undefined,
              boxShadow: activeTab === 'idea'
                ? isDarkMode ? '0 0 8px rgba(255, 215, 64, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                : 'none',
              fontWeight: activeTab === 'idea' ? 600 : 400,
            }}
          >
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
              <SimplifiedIntakeForm
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
              <SimplifiedIntakeForm
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
              <SimplifiedIntakeForm
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