import { useState } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateRFQId } from "@/lib/utils";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
}

export function RFQIntakeForm() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    const newFiles: FileUpload[] = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate unique RFQ ID
    const rfqId = generateRFQId();

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "RFQ Submitted Successfully",
        description: `Your RFQ has been submitted and assigned ID: ${rfqId}`,
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Submit New RFQ</h1>
        <p className="text-muted-foreground">
          Provide details about your manufacturing requirements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company & Contact Information */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Company & Contact Information</CardTitle>
            <CardDescription>
              Tell us about your organization and primary contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Acme Manufacturing Co." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" placeholder="John Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@acme.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Describe your manufacturing requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="Automotive Component Series A" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select required>
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
                <Label htmlFor="quantity">Expected Quantity</Label>
                <Input id="quantity" type="number" placeholder="1000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Required Delivery Date</Label>
                <Input id="deadline" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your manufacturing requirements, materials, tolerances, and any special considerations..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Documents & Drawings</CardTitle>
            <CardDescription>
              Upload CAD files, drawings, BOMs, and specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-foreground">
                      Upload your files
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      PDF, STEP, IGES, XLSX, or CAD files up to 10MB each
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.step,.stp,.iges,.igs,.xlsx,.dwg,.dxf"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="mt-4">
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose Files
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files ({files.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
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

            <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Required Documents:</p>
                <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                  <li>Technical drawings or CAD files</li>
                  <li>Bill of Materials (BOM)</li>
                  <li>Specifications or requirements document</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting || files.length === 0}
            className="min-w-40"
          >
            {isSubmitting ? "Submitting..." : "Submit RFQ"}
          </Button>
        </div>
      </form>
    </div>
  );
}