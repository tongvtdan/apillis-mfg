import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  ProjectIntakeFormSchema,
  ProjectIntakeFormData,
  validateFileUploads,
  validateFileUpload
} from "@/lib/validation/project-schemas";
import { handleDatabaseError } from "@/lib/validation/error-handlers";

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
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

  const { toast } = useToast();
  const { createProject, createOrGetCustomer } = useProjects();

  // Initialize form with validation
  const form = useForm<ProjectIntakeFormData>({
    resolver: zodResolver(ProjectIntakeFormSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      projectTitle: "",
      description: "",
      priority: "medium",
      estimatedValue: "",
      dueDate: "",
      notes: ""
    }
  });

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

    const fileArray = Array.from(files);
    const validationResult = validateFileUploads(fileArray);

    if (!validationResult.isValid) {
      setFileValidationErrors(validationResult.errors);
      toast({
        variant: "destructive",
        title: "File Upload Error",
        description: validationResult.errors[0], // Show first error
      });
      return;
    }

    // Clear any previous validation errors
    setFileValidationErrors([]);

    const newFiles: FileUpload[] = fileArray.map(file => ({
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

  const handleSubmit = async (data: ProjectIntakeFormData) => {
    // Validate files before submission
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
        name: data.contactName,
        company: data.companyName,
        email: data.contactEmail || undefined,
        phone: data.contactPhone || undefined
      });

      // Create project
      const project = await createProject({
        title: data.projectTitle || `${submissionType} from ${data.companyName}`,
        description: data.description || undefined,
        customer_id: customer.id,
        priority: data.priority,
        estimated_value: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
        due_date: data.dueDate || undefined,
        contact_name: data.contactName,
        contact_email: data.contactEmail || undefined,
        contact_phone: data.contactPhone || undefined,
        notes: data.notes || undefined,
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

      // Handle database errors with user-friendly messages
      const userError = handleDatabaseError(error);

      toast({
        variant: "destructive",
        title: userError.title,
        description: userError.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle2 className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-accent-foreground">Project Submitted Successfully!</CardTitle>
          <CardDescription className="text-accent-foreground/80">
            Your {submissionType.toLowerCase()} has been received and assigned ID: <strong>{tempProjectId}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-accent-foreground/70 mb-4">
            You will receive email updates as your project progresses through our review process.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
            Submit Another Project
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Project ID Display */}
        <div className="project-header">
          <p className="text-sm text-muted-foreground mb-1">Temporary Project ID</p>
          <p className="project-header-title">{tempProjectId}</p>
          <p className="text-xs text-muted-foreground mt-1">
            A permanent ID will be assigned upon submission
          </p>
        </div>

        {/* Company & Contact Information */}
        <Card className="project-card">
          <CardHeader className="project-card-header">
            <CardTitle>Company & Contact Information</CardTitle>
            <CardDescription>
              Tell us about your company and the primary contact for this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter company name"
                        className="project-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact person name"
                        className="project-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        className="project-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        className="project-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="project-card">
          <CardHeader className="project-card-header">
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide details about your manufacturing project or requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter ${submissionType.toLowerCase()} title`}
                      className="project-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project requirements, materials, quantities, specifications, etc."
                      className="min-h-[100px] project-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="project-select">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="project-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="project-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information, special requirements, or notes..."
                      className="min-h-[80px] project-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="project-card">
          <CardHeader className="project-card-header">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
            <CardDescription>
              Upload drawings, specifications, samples, or any relevant documents. (Required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="file-upload-area">
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <Label htmlFor="fileUpload" className="cursor-pointer file-upload-label hover:underline">
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
                    <div key={file.id} className="flex items-center justify-between file-item">
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

            {/* File validation errors */}
            {fileValidationErrors.length > 0 && (
              <div className="space-y-2">
                {fileValidationErrors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                ))}
              </div>
            )}

            {uploadedFiles.length === 0 && fileValidationErrors.length === 0 && (
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
            disabled={isSubmitting || uploadedFiles.length === 0 || !form.formState.isValid}
            className="min-w-[200px] project-submit-button"
          >
            {isSubmitting ? "Submitting..." : `Submit ${submissionType}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Legacy compatibility
export const RFQIntakeForm = ProjectIntakeForm;