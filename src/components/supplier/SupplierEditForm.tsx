import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Building2,
    User,
    Mail,
    Phone,
    Globe,
    MapPin,
    Wrench,
    Package,
    Ruler,
    Calendar,
    FileText,
    Award,
    CreditCard,
    Tag,
    Upload,
    X,
    File,
    Image,
    FileText as FileTextIcon,
    Archive,
    Plus,
    Save
} from "lucide-react";
import { useAuth } from "@/core/auth";
import { useToast } from "@/shared/hooks/use-toast";
import { SupplierSpecialty, Supplier } from "@/types/supplier";
import { SUPPLIER_TYPE_CONFIG } from "@/features/supplier-management";
import { SupplierManagementService } from "@/features/supplier-management/services/supplierManagementService";

interface SupplierEditFormProps {
    supplier: Supplier;
    onSuccess?: (supplier: Supplier) => void;
    onCancel?: () => void;
}

const SPECIALTIES: SupplierSpecialty[] = [
    'machining',
    'fabrication',
    'casting',
    'finishing',
    'injection_molding',
    'assembly',
    '3d_printing',
    'prototyping',
    'coating',
    'painting',
    'welding',
    'sheet_metal',
    'electronics',
    'testing',
    'packaging'
];

const SPECIALTY_LABELS: Record<SupplierSpecialty, string> = {
    machining: 'CNC Machining',
    fabrication: 'Metal Fabrication',
    casting: 'Casting & Molding',
    finishing: 'Surface Finishing',
    injection_molding: 'Injection Molding',
    assembly: 'Assembly Services',
    '3d_printing': '3D Printing',
    prototyping: 'Rapid Prototyping',
    coating: 'Coating Services',
    painting: 'Painting & Powder Coating',
    welding: 'Welding Services',
    sheet_metal: 'Sheet Metal Work',
    electronics: 'Electronics Assembly',
    testing: 'Testing & Validation',
    packaging: 'Packaging Services'
};

const CERTIFICATIONS = [
    'ISO 9001',
    'ISO 14001',
    'AS9100',
    'IATF 16949',
    'ISO 13485',
    'TL 9000',
    'OHSAS 18001',
    'SA8000',
    'ISO 22000',
    'FSSC 22000',
    'BRCGS',
    'SQF',
    'HACCP',
    'ITAR Registered',
    'EAR99',
    'RoHS Compliant',
    'REACH Compliant',
    'Conflict Minerals Compliant'
];

const PAYMENT_TERMS = [
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60',
    'Net 90',
    '2/10 Net 30',
    'COD',
    'CIA',
    '50% Deposit'
];

const CURRENCIES = [
    'USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'MXN', 'AUD', 'CHF', 'SEK', 'VND'
];

const INCOTERMS = [
    'EXW', 'FCA', 'CPT', 'CIP', 'DAT', 'DAP', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'
];

const PRIORITY_COUNTRIES = [
    'Vietnam',
    'United States',
    'Malaysia',
    'China'
];

export function SupplierEditForm({ supplier, onSuccess, onCancel }: SupplierEditFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state - initialize with supplier data
    const [formData, setFormData] = useState({
        // Organization info
        name: supplier.name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        website: "",
        address: supplier.address || "",
        city: "",
        state: "",
        country: supplier.country || "",
        postalCode: "",

        // Capabilities
        specialties: supplier.specialties || [],
        materials: [] as string[],

        // Compliance
        certifications: [] as string[],
        paymentTerms: "Net 30",
        currency: "USD",
        incoterms: "FOB Origin",

        // Metadata
        tags: supplier.tags || [],
        internalNotes: supplier.notes || "",
    });

    const [newTag, setNewTag] = useState("");
    const [newMaterial, setNewMaterial] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [fileDocumentTypes, setFileDocumentTypes] = useState<Record<number, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for external links
    const [externalLinks, setExternalLinks] = useState<Array<{ title: string, url: string, description?: string }>>([]);
    const [newExternalLink, setNewExternalLink] = useState({ title: '', url: '', description: '' });

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper component for error display
    const ErrorMessage = ({ field }: { field: string }) => {
        return errors[field] ? (
            <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
        ) : null;
    };

    const handleSpecialtyChange = (specialty: SupplierSpecialty) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter(s => s !== specialty)
                : [...prev.specialties, specialty]
        }));
    };

    const handleCertificationChange = (cert: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.includes(cert)
                ? prev.certifications.filter(c => c !== cert)
                : [...prev.certifications, cert]
        }));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleAddMaterial = () => {
        if (newMaterial.trim() && !formData.materials.includes(newMaterial.trim())) {
            setFormData(prev => ({
                ...prev,
                materials: [...prev.materials, newMaterial.trim()]
            }));
            setNewMaterial("");
        }
    };

    const handleRemoveMaterial = (material: string) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.filter(m => m !== material)
        }));
    };

    const handleAddExternalLink = () => {
        if (newExternalLink.title.trim() && newExternalLink.url.trim()) {
            // Simple URL validation
            try {
                new URL(newExternalLink.url);
                setExternalLinks(prev => [...prev, { ...newExternalLink }]);
                setNewExternalLink({ title: '', url: '', description: '' });
            } catch (e) {
                toast({
                    title: "Invalid URL",
                    description: "Please enter a valid URL including http:// or https://",
                    variant: "destructive"
                });
            }
        }
    };

    const handleRemoveExternalLink = (index: number) => {
        setExternalLinks(prev => prev.filter((_, i) => i !== index));
    };

    // File upload handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            // Check file size (max 5MB each)
            const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024);
            if (validFiles.length < newFiles.length) {
                toast({
                    title: "File Size Limit Exceeded",
                    description: "Some files exceed the 5MB limit and were not added.",
                    variant: "destructive"
                });
            }
            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        // Remove document type for this file
        setFileDocumentTypes(prev => {
            const newTypes = { ...prev };
            delete newTypes[index];
            // Reindex the remaining types
            const reindexedTypes: Record<number, string> = {};
            Object.keys(newTypes).forEach((key, newIndex) => {
                reindexedTypes[newIndex] = newTypes[parseInt(key)];
            });
            return reindexedTypes;
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getFileIcon = (file: File) => {
        const type = file.type.toLowerCase();

        if (type.startsWith('image/')) {
            return <Image className="h-8 w-8 text-blue-500" />;
        } else if (type.includes('pdf')) {
            return <FileTextIcon className="h-8 w-8 text-red-500" />;
        } else if (type.includes('zip') || type.includes('rar')) {
            return <Archive className="h-8 w-8 text-yellow-500" />;
        } else {
            return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateWebsite = (website: string): boolean => {
        if (!website.trim()) return true; // Optional field
        const websiteRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return websiteRegex.test(website);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Required field validations
        if (!formData.name.trim()) {
            newErrors.name = "Organization name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Primary contact email is required";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (!formData.country.trim()) {
            newErrors.country = "Country is required";
        }

        // Optional field validations
        if (formData.website.trim() && !validateWebsite(formData.website)) {
            newErrors.website = "Please enter a valid website URL (e.g., www.example.com)";
        }

        if (formData.phone.trim() && formData.phone.length < 10) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        if (!user?.id) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to update a supplier.",
                variant: "destructive"
            });
            return;
        }

        // Validate form before submission
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors below before submitting.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform form data to match supplier update schema
            const updateData = {
                name: formData.name,
                description: formData.internalNotes,
                email: formData.email,
                phone: formData.phone,
                website: formData.website || undefined,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                postalCode: formData.postalCode,
                capabilities: formData.specialties,
                certifications: formData.certifications,
                qualityStandards: formData.certifications.filter(c => c.includes('ISO')),
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                notes: formData.internalNotes,
                // Add contacts and locations arrays
                contacts: formData.email ? [{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    isPrimary: true,
                    title: "Primary Contact"
                }] : [],
                locations: [{
                    name: "Primary Location",
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    isPrimary: true,
                    state: formData.state,
                    postalCode: formData.postalCode
                }]
            };

            const updatedSupplier = await SupplierManagementService.updateSupplier(
                supplier.id,
                updateData,
                user.id
            );

            toast({
                title: "Supplier Updated Successfully!",
                description: `Supplier "${updatedSupplier.name || formData.name}" has been updated successfully.`
            });

            onSuccess?.(updatedSupplier);
        } catch (error) {
            console.error("Error updating supplier:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update supplier",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Edit Supplier</h1>
                    <p className="text-muted-foreground">
                        Update supplier information and capabilities
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Supplier Organization
                        </CardTitle>
                        <CardDescription>
                            Core supplier information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter organization name"
                                />
                                <ErrorMessage field="name" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Primary Contact Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="contact@company.com"
                                />
                                <ErrorMessage field="email" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="+1 (555) 123-4567"
                                />
                                <ErrorMessage field="phone" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                    placeholder="https://www.company.com"
                                />
                                <ErrorMessage field="website" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="123 Main Street"
                            />
                            <ErrorMessage field="address" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    placeholder="City"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State/Province</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                    placeholder="State"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITY_COUNTRIES.map(country => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <ErrorMessage field="country" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                                id="postalCode"
                                value={formData.postalCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                                placeholder="12345"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Capabilities Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Capabilities & Specialties
                        </CardTitle>
                        <CardDescription>
                            Select the manufacturing processes and materials this supplier can handle
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Manufacturing Processes</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SPECIALTIES.map(specialty => (
                                    <div key={specialty} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={specialty}
                                            checked={formData.specialties.includes(specialty)}
                                            onCheckedChange={() => handleSpecialtyChange(specialty)}
                                        />
                                        <Label htmlFor={specialty} className="text-sm">
                                            {SPECIALTY_LABELS[specialty]}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Materials</Label>
                            <div className="flex flex-wrap gap-2">
                                {formData.materials.map(material => (
                                    <div key={material} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                        <span className="text-sm">{material}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMaterial(material)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newMaterial}
                                    onChange={(e) => setNewMaterial(e.target.value)}
                                    placeholder="Add material (e.g., Aluminum, Steel)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMaterial())}
                                />
                                <Button type="button" onClick={handleAddMaterial} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Compliance & Certifications
                        </CardTitle>
                        <CardDescription>
                            Quality standards and certifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Certifications</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {CERTIFICATIONS.map(cert => (
                                    <div key={cert} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={cert}
                                            checked={formData.certifications.includes(cert)}
                                            onCheckedChange={() => handleCertificationChange(cert)}
                                        />
                                        <Label htmlFor={cert} className="text-sm">
                                            {cert}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">Payment Terms</Label>
                                <Select
                                    value={formData.paymentTerms}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_TERMS.map(term => (
                                            <SelectItem key={term} value={term}>
                                                {term}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map(currency => (
                                            <SelectItem key={currency} value={currency}>
                                                {currency}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="incoterms">Incoterms</Label>
                                <Select
                                    value={formData.incoterms}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, incoterms: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INCOTERMS.map(term => (
                                            <SelectItem key={term} value={term}>
                                                {term}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tags and Notes Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Tags & Notes
                        </CardTitle>
                        <CardDescription>
                            Additional metadata and internal notes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md">
                                        <span className="text-sm">{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add tag"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                />
                                <Button type="button" onClick={handleAddTag} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="internalNotes">Internal Notes</Label>
                            <Textarea
                                id="internalNotes"
                                value={formData.internalNotes}
                                onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                                placeholder="Add any internal notes about this supplier..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isSubmitting ? "Updating..." : "Update Supplier"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
