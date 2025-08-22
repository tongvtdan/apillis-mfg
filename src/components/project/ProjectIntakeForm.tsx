import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, File, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { ProjectPriority } from "@/types/project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ProjectIntakeFormProps {
  submissionType: "RFQ" | "Purchase Order" | "Project Idea";
  onSuccess?: (projectId: string) => void;
}

export function ProjectIntakeForm({ submissionType, onSuccess }: ProjectIntakeFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tempProjectId, setTempProjectId] = useState<string>("");
  const [formData, setFormData] = useState({
    // Company & Contact Information
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    
    // Project Details
    projectTitle: "",
    description: "",
    priority: "medium" as ProjectPriority,
    estimatedValue: "",
    dueDate: "",
    
    // Additional Information
    notes: ""
  });

  const { toast } = useToast();
  const { createProject, createOrGetCustomer } = useProjects();

  // Generate temporary project ID when component mounts
  useState(() => {
    const generateTempId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
      return `P-${year}${month}${day}${sequence}`;
    };
    
    setTempProjectId(generateTempId());
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: FileUpload[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files uploaded",
        description: "Please upload at least one file before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or get customer
      const customer = await createOrGetCustomer({
        name: formData.contactName,
        company: formData.companyName,
        email: formData.contactEmail,
        phone: formData.contactPhone
      });

      // Create project
      const project = await createProject({
        title: formData.projectTitle || `${submissionType} from ${formData.companyName}`,
        description: formData.description,
        customer_id: customer.id,
        priority: formData.priority,
        estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        due_date: formData.dueDate || undefined,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        notes: formData.notes,
        tags: [submissionType.toLowerCase().replace(' ', '_')]
      });

      // TODO: Upload files to Supabase Storage and create project_documents records
      // This would be implemented in Phase 1 completion

      setIsSubmitted(true);
      
      toast({
        title: "Project Submitted Successfully!",
        description: `Your ${submissionType.toLowerCase()} has been submitted with ID: ${project.project_id}`,
      });

      onSuccess?.(project.project_id);

    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was an error submitting your project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Project Submitted Successfully!</CardTitle>
          <CardDescription className="text-green-600">
            Your {submissionType.toLowerCase()} has been received and assigned ID: <strong>{tempProjectId}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-green-600 mb-4">
            You will receive email updates as your project progresses through our review process.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Submit Another Project
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Project ID Display */}
      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-muted-foreground mb-1">Temporary Project ID</p>
        <p className="text-xl font-mono font-semibold text-primary">{tempProjectId}</p>
        <p className="text-xs text-muted-foreground mt-1">
          A permanent ID will be assigned upon submission
        </p>
      </div>

      {/* Company & Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company & Contact Information</CardTitle>
          <CardDescription>
            Tell us about your company and the primary contact for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="Enter contact person name"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email Address *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide details about your manufacturing project or requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title *</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) => handleInputChange('projectTitle', e.target.value)}
              placeholder={`Enter ${submissionType.toLowerCase()} title`}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project requirements, materials, quantities, specifications, etc."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value: ProjectPriority) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
              <Input
                id="estimatedValue"
                type="number"
                step="0.01"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Target Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information, special requirements, or notes..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
          <CardDescription>
            Upload drawings, specifications, samples, or any relevant documents. (Required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <Label htmlFor="fileUpload" className="cursor-pointer text-primary hover:underline">
                  Click to upload files
                </Label>
                <Input
                  id="fileUpload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.dwg,.dxf,.step,.stp,.iges,.igs,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <p className="text-muted-foreground">or drag and drop</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, CAD files (DWG, DXF, STEP), Images, Office documents
              </p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">At least one file must be uploaded before submission.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting || uploadedFiles.length === 0}
          className="min-w-[200px]"
        >
          {isSubmitting ? "Submitting..." : `Submit ${submissionType}`}
        </Button>
      </div>
    </form>
  );
}

// Legacy compatibility
export const RFQIntakeForm = ProjectIntakeForm;