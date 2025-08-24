import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CalendarIcon, 
  Search, 
  Send, 
  FileText, 
  Clock, 
  Star, 
  MapPin,
  Building2,
  Mail,
  Phone,
  Filter,
  X
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { 
  Supplier, 
  SupplierSpecialty, 
  SPECIALTY_LABELS,
  SendRFQRequest 
} from "@/types/supplier";
import { Project } from "@/types/project";

interface SupplierQuoteModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SupplierSelection {
  supplier: Supplier;
  selected: boolean;
}

export function SupplierQuoteModal({ project, isOpen, onClose, onSuccess }: SupplierQuoteModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<SupplierSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<SupplierSpecialty[]>([]);
  const [quoteDeadline, setQuoteDeadline] = useState<Date | undefined>();
  const [rfqMessage, setRfqMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const { toast } = useToast();
  const { suppliers, loading: loadingSuppliers, searchSuppliers } = useSuppliers();
  const { sendRFQToSuppliers } = useSupplierQuotes();

  // Initialize suppliers selection
  useEffect(() => {
    if (suppliers.length > 0) {
      setSelectedSuppliers(
        suppliers.map(supplier => ({
          supplier,
          selected: false
        }))
      );
    }
  }, [suppliers]);

  // Generate default RFQ message
  useEffect(() => {
    if (project && !rfqMessage) {
      const defaultMessage = `Dear Supplier,

We would like to request a quote for the following project:

Project: ${project.title}
Project ID: ${project.project_id}
${project.description ? `Description: ${project.description}` : ''}
${project.estimated_value ? `Estimated Value: $${project.estimated_value.toLocaleString()}` : ''}
${project.due_date ? `Target Completion: ${format(new Date(project.due_date), 'PPP')}` : ''}

Please provide your quotation including:
- Unit pricing and total cost
- Lead time for completion
- Payment terms
- Delivery terms
- Any technical specifications or clarifications

Please respond by the deadline specified. If you have any questions, feel free to contact us.

Best regards,
[Your Company Name]`;

      setRfqMessage(defaultMessage);
    }
  }, [project, rfqMessage]);

  // Filter suppliers based on search and filters
  const filteredSuppliers = selectedSuppliers.filter(({ supplier }) => {
    // Text search
    const matchesSearch = !searchTerm || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Specialty filter
    const matchesSpecialty = selectedSpecialties.length === 0 || 
      selectedSpecialties.some(specialty => supplier.specialties.includes(specialty));

    // Rating filter
    const matchesRating = supplier.rating >= minRating;

    // Active suppliers only
    const isActive = supplier.is_active;

    return matchesSearch && matchesSpecialty && matchesRating && isActive;
  });

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.map(item => 
        item.supplier.id === supplierId 
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = filteredSuppliers.every(item => item.selected);
    setSelectedSuppliers(prev => 
      prev.map(item => ({
        ...item,
        selected: filteredSuppliers.find(filtered => filtered.supplier.id === item.supplier.id) 
          ? !allSelected 
          : item.selected
      }))
    );
  };

  const getSelectedCount = () => {
    return selectedSuppliers.filter(item => item.selected).length;
  };

  const handleSpecialtyFilter = (specialty: SupplierSpecialty) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialties([]);
    setMinRating(0);
    setShowFilters(false);
  };

  const handleSubmit = async () => {
    const selectedSupplierIds = selectedSuppliers
      .filter(item => item.selected)
      .map(item => item.supplier.id);

    if (selectedSupplierIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No Suppliers Selected",
        description: "Please select at least one supplier to send the RFQ.",
      });
      return;
    }

    if (!quoteDeadline) {
      toast({
        variant: "destructive",
        title: "Missing Deadline",
        description: "Please set a deadline for quote responses.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const request: SendRFQRequest = {
        project_id: project.id,
        supplier_ids: selectedSupplierIds,
        quote_deadline: quoteDeadline?.toISOString(),
        rfq_message: rfqMessage
      };

      const success = await sendRFQToSuppliers(request);

      if (success) {
        toast({
          title: "RFQ Sent Successfully",
          description: `RFQ sent to ${selectedSupplierIds.length} supplier(s)`,
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error sending RFQ:', error);
      toast({
        variant: "destructive",
        title: "Error Sending RFQ",
        description: "Failed to send RFQ. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSupplierCard = ({ supplier, selected }: SupplierSelection) => (
    <Card 
      key={supplier.id} 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={() => handleSupplierToggle(supplier.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Checkbox 
              checked={selected}
              onChange={() => handleSupplierToggle(supplier.id)}
            />
            <div>
              <h4 className="font-semibold text-sm">{supplier.name}</h4>
              {supplier.company && (
                <p className="text-xs text-muted-foreground flex items-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  {supplier.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-xs font-medium">{supplier.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {supplier.email && (
            <p className="text-xs text-muted-foreground flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {supplier.email}
            </p>
          )}
          
          {supplier.country && (
            <p className="text-xs text-muted-foreground flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {supplier.country}
            </p>
          )}
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span>{supplier.response_rate.toFixed(0)}% response rate</span>
            <span className="mx-2">•</span>
            <span>{supplier.average_turnaround_days.toFixed(1)}d avg turnaround</span>
          </div>
          
          {supplier.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {supplier.specialties.slice(0, 3).map(specialty => (
                <Badge key={specialty} variant="secondary" className="text-xs px-1 py-0">
                  {SPECIALTY_LABELS[specialty]}
                </Badge>
              ))}
              {supplier.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{supplier.specialties.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Send RFQ to Suppliers</DialogTitle>
          <DialogDescription>
            Select suppliers and send a Request for Quotation for project {project.project_id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Left Panel - Supplier Selection */}
          <div className="flex-1 flex flex-col">
            <div className="space-y-4 mb-4">
              {/* Search and Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      Filters
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Specialties Filter */}
                    <div>
                      <Label className="text-xs">Specialties</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(SPECIALTY_LABELS).map(([specialty, label]) => (
                          <Badge
                            key={specialty}
                            variant={selectedSpecialties.includes(specialty as SupplierSpecialty) ? "default" : "outline"}
                            className="text-xs cursor-pointer"
                            onClick={() => handleSpecialtyFilter(specialty as SupplierSpecialty)}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <Label className="text-xs">Minimum Rating</Label>
                      <div className="flex gap-2 mt-1">
                        {[0, 3, 4, 4.5].map(rating => (
                          <Button
                            key={rating}
                            variant={minRating === rating ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setMinRating(rating)}
                          >
                            {rating === 0 ? "Any" : `${rating}+`}
                            <Star className="w-3 h-3 ml-1" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Selection Summary */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {getSelectedCount()} of {filteredSuppliers.length} suppliers selected
                </p>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {filteredSuppliers.every(item => item.selected) ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>

            {/* Suppliers List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {loadingSuppliers ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading suppliers...</p>
                  </div>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No suppliers found matching your criteria.</p>
                  </div>
                ) : (
                  filteredSuppliers.map(renderSupplierCard)
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* Right Panel - RFQ Details */}
          <div className="w-80 flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium text-sm">{project.title}</p>
                  <p className="text-xs text-muted-foreground">ID: {project.project_id}</p>
                </div>
                {project.estimated_value && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Est. Value:</span> 
                    ${project.estimated_value.toLocaleString()}
                  </p>
                )}
                {project.due_date && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Due Date:</span> 
                    {format(new Date(project.due_date), 'PPP')}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <Label htmlFor="deadline">Quote Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !quoteDeadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {quoteDeadline ? format(quoteDeadline, "PPP") : "Select deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={quoteDeadline}
                      onSelect={setQuoteDeadline}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="message">RFQ Message</Label>
                <Textarea
                  id="message"
                  value={rfqMessage}
                  onChange={(e) => setRfqMessage(e.target.value)}
                  placeholder="Enter your RFQ message..."
                  className="h-32 text-xs mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || getSelectedCount() === 0}
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send RFQ to {getSelectedCount()} Supplier{getSelectedCount() !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}