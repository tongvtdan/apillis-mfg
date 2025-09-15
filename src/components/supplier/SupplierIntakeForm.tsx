import { useState, useRef } from "react";
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
    Plus
} from "lucide-react";
import { useAuth } from "@/core/auth";
import { useToast } from "@/shared/hooks/use-toast";
import { SupplierSpecialty } from "@/types/supplier";
import { SUPPLIER_TYPE_CONFIG } from "@/features/supplier-management";
import { SupplierManagementService } from "@/features/supplier-management/services/supplierManagementService";
import { generateSupplierSampleData } from "@/utils/supplierSampleData";

interface SupplierIntakeFormProps {
    onSuccess?: (supplierId: string) => void;
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

// Grouped processes for better organization
const PROCESS_GROUPS = {
    Machining: ['machining'],
    Fabrication: ['fabrication', 'sheet_metal', 'welding', 'casting'],
    Manufacturing: ['injection_molding', '3d_printing', 'prototyping'],
    Finishing: ['finishing', 'coating', 'painting'],
    Assembly: ['assembly', 'electronics'],
    Quality: ['testing'],
    "Service Provider": ['packaging']
    // Note: logistics is not currently in SPECIALTIES, so we can't include it yet
    // Others group removed since packaging is now in Service Provider
};

// Grouped materials for better organization
const MATERIALS_GROUPS = {
    Metals: ['Aluminum', 'Steel', 'Stainless Steel', 'Titanium', 'Copper', 'Brass', 'Bronze'],
    Plastics: ['Plastic', 'ABS', 'Polycarbonate', 'Nylon', 'PVC'],
    Composites: ['Ceramic', 'Composite', 'Carbon Fiber', 'Fiberglass'],
    Others: ['Rubber', 'Silicone', 'Wood', 'Glass']
};

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

// Priority countries list
const PRIORITY_COUNTRIES = [
    'Vietnam',
    'United States',
    'Malaysia',
    'China'
];

export function SupplierIntakeForm({ onSuccess, onCancel }: SupplierIntakeFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Organization info
        name: "",
        email: "",
        phone: "",
        website: undefined,
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",

        // Capabilities
        specialties: [] as SupplierSpecialty[],
        materials: [] as string[],

        // Compliance
        certifications: [] as string[],
        paymentTerms: "Net 30",
        currency: "USD",
        incoterms: "FOB Origin",

        // Metadata
        tags: [] as string[],
        internalNotes: "",
    });

    const [newTag, setNewTag] = useState("");
    const [newMaterial, setNewMaterial] = useState("");
    const [newProcess, setNewProcess] = useState("");
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

    // Document types based on wireframe design
    const DOCUMENT_TYPES = [
        { value: 'supplier_profile', label: 'Company Profile' },
        { value: 'supplier_logo', label: 'Company Logo' },
        { value: 'supplier_qualified_image', label: 'Qualified Product Image' },
        { value: 'supplier_external_link', label: 'External Document Link' },
        { value: 'product_catalog', label: 'Product Catalog' },
        { value: 'quality_manual', label: 'Quality Manual' },
        { value: 'sustainability_report', label: 'Sustainability Report' },
        { value: 'other', label: 'Other Document' }
    ];

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

    const handleAddProcess = () => {
        const trimmedProcess = newProcess.trim();
        if (trimmedProcess && !formData.specialties.includes(trimmedProcess as SupplierSpecialty)) {
            // Allow custom processes to be added
            setFormData(prev => ({
                ...prev,
                specialties: [...prev.specialties, trimmedProcess as SupplierSpecialty]
            }));
            setNewProcess("");
        }
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

    // Sample data functionality
    const handleFillSampleData = () => {
        const sampleData = generateSupplierSampleData();

        setFormData({
            // Organization info
            name: sampleData.name,
            email: sampleData.email,
            phone: sampleData.phone,
            website: sampleData.website,
            address: sampleData.address,
            city: sampleData.city,
            state: sampleData.state,
            country: sampleData.country,
            postalCode: sampleData.postalCode,

            // Capabilities
            specialties: sampleData.specialties,
            materials: sampleData.materials,

            // Compliance
            certifications: sampleData.certifications,
            paymentTerms: sampleData.paymentTerms,
            currency: sampleData.currency,
            incoterms: sampleData.incoterms,

            // Metadata
            tags: sampleData.tags,
            internalNotes: sampleData.internalNotes,
        });

        // Clear any existing errors
        setErrors({});

        toast({
            title: "Sample Data Loaded",
            description: "Form has been filled with sample supplier data. You can modify any fields as needed.",
        });
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

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
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
                description: "You must be logged in to create a supplier.",
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
            // Transform form data to match supplier schema
            const supplierData = {
                name: formData.name,
                companyName: formData.name,
                email: formData.email,
                phone: formData.phone,
                website: formData.website || undefined,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                postalCode: formData.postalCode,
                supplierType: 'manufacturer' as const,
                status: 'active' as const,
                qualificationStatus: 'not_qualified' as const,
                capabilities: formData.specialties,
                certifications: formData.certifications,
                qualityStandards: formData.certifications.filter(c => c.includes('ISO')),
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                description: formData.internalNotes,
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

            const supplier = await SupplierManagementService.createSupplier(supplierData, user.id);


            // Show a message about the files and links that would be uploaded
            // In a future implementation, we would actually upload these files
            if (uploadedFiles.length > 0 || externalLinks.length > 0) {
                toast({
                    title: "Supplier Created Successfully!",
                    description: `New supplier "${supplier.name || formData.name}" has been created successfully! ${uploadedFiles.length} files and ${externalLinks.length} external links will be processed.`
                });
            } else {
                toast({
                    title: "Supplier Created Successfully!",
                    description: `New supplier "${supplier.name || formData.name}" has been created successfully.`
                });
            }

            onSuccess?.(supplier.id);
        } catch (error) {
            console.error("Error creating supplier:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create supplier",
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
                    <h1 className="text-3xl font-bold">Add New Supplier</h1>
                    <p className="text-muted-foreground">
                        Onboard a new supplier into your qualified vendor base
                    </p>
                </div>

                {/* Sample Data Button */}
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleFillSampleData}
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Fill Sample Data
                    </Button>
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
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Acme Precision Machining LLC"
                                    required
                                    className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMessage field="name" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Primary Contact Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john.smith@acme-machining.com"
                                    required
                                    className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMessage field="email" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1-555-123-4567"
                                    className={errors.phone ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMessage field="phone" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="www.acme-machining.com"
                                    className={errors.website ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMessage field="website" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Industrial Blvd"
                                    required
                                    className={errors.address ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMessage field="address" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Torrance"
                                    required
                                    className={errors.city ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMessage field="city" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="CA"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                                >
                                    <SelectTrigger className={errors.country ? "border-red-500 focus:border-red-500" : ""}>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITY_COUNTRIES.map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <ErrorMessage field="country" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    placeholder="90210"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Supplier Capabilities & Profile
                        </CardTitle>
                        <CardDescription>
                            Processes, materials, and capabilities
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Processes *</Label>
                            <div className="space-y-4">
                                {Object.entries(PROCESS_GROUPS).map(([group, processes]) => (
                                    <div key={group} className="space-y-2">
                                        <h4 className="font-medium text-sm">{group}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {processes.map((process) => (
                                                <div key={process} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`specialty-${process}`}
                                                        checked={formData.specialties.includes(process as SupplierSpecialty)}
                                                        onCheckedChange={() => handleSpecialtyChange(process as SupplierSpecialty)}
                                                    />
                                                    <Label htmlFor={`specialty-${process}`} className="text-sm">
                                                        {SPECIALTY_LABELS[process as SupplierSpecialty]}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newProcess}
                                    onChange={(e) => setNewProcess(e.target.value)}
                                    placeholder="Add custom process"
                                />
                                <Button type="button" onClick={handleAddProcess} variant="outline">
                                    Add
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Materials *</Label>
                            <div className="space-y-4">
                                {Object.entries(MATERIALS_GROUPS).map(([group, materials]) => (
                                    <div key={group} className="space-y-2">
                                        <h4 className="font-medium text-sm">{group}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {materials.map((material) => (
                                                <div key={material} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`material-${material}`}
                                                        checked={formData.materials.includes(material)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    materials: [...prev.materials, material]
                                                                }));
                                                            } else {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    materials: prev.materials.filter(m => m !== material)
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`material-${material}`} className="text-sm">
                                                        {material}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newMaterial}
                                    onChange={(e) => setNewMaterial(e.target.value)}
                                    placeholder="Add custom material"
                                />
                                <Button type="button" onClick={handleAddMaterial} variant="outline">
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Removed tolerance capability, max part size, and lead time fields */}

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Certifications & Compliance
                        </CardTitle>
                        <CardDescription>
                            Certifications and business terms
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Certifications</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {CERTIFICATIONS.map((cert) => (
                                    <div key={cert} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cert-${cert}`}
                                            checked={formData.certifications.includes(cert)}
                                            onCheckedChange={() => handleCertificationChange(cert)}
                                        />
                                        <Label htmlFor={`cert-${cert}`} className="text-sm">
                                            {cert}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">Payment Terms</Label>
                                <Select
                                    value={formData.paymentTerms}
                                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_TERMS.map((term) => (
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
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((currency) => (
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
                                    onValueChange={(value) => setFormData({ ...formData, incoterms: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INCOTERMS.map((term) => (
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Metadata & Tags
                        </CardTitle>
                        <CardDescription>
                            Internal notes and categorization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map((tag, index) => (
                                    <div key={index} className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add tag (e.g., Aerospace, High Priority)"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                />
                                <Button type="button" onClick={handleAddTag} variant="outline">
                                    Add
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="internalNotes">Internal Notes</Label>
                            <Textarea
                                id="internalNotes"
                                value={formData.internalNotes}
                                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                                placeholder="Met at IMTS 2025. Strong in 5-axis titanium work. Pricing competitive."
                                rows={4}
                            />
                        </div>

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Supplier Profile Documents
                        </CardTitle>
                        <CardDescription>
                            Upload official supplier profile materials (max 5MB per file)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <div className="space-y-2">
                                <p className="text-lg font-medium">
                                    Drop files here or{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={triggerFileInput}
                                    >
                                        browse
                                    </button>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Supported: PDF, JPG, PNG, SVG, DOCX (company brochure, overview, logo)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    ⚠️ Files must be ≤5MB each. Use ZIP if combining multiple files.
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.svg,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Uploaded Files</h4>
                                <div className="space-y-2">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center space-x-2">
                                                {getFileIcon(file)}
                                                <div>
                                                    <p className="text-sm font-medium">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Select
                                                    value={fileDocumentTypes[index] || ""}
                                                    onValueChange={(value) => setFileDocumentTypes(prev => ({ ...prev, [index]: value }))}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue placeholder="Document Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DOCUMENT_TYPES.filter(dt => dt.value !== 'supplier_external_link').map((docType) => (
                                                            <SelectItem key={docType.value} value={docType.value}>
                                                                {docType.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* External Document Links Section */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">External Document Links</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="Document Title"
                                    value={newExternalLink.title}
                                    onChange={(e) => setNewExternalLink({ ...newExternalLink, title: e.target.value })}
                                />
                                <Input
                                    placeholder="https://example.com/document.pdf"
                                    value={newExternalLink.url}
                                    onChange={(e) => setNewExternalLink({ ...newExternalLink, url: e.target.value })}
                                />
                                <Button type="button" onClick={handleAddExternalLink} variant="outline">
                                    Add Link
                                </Button>
                            </div>
                            {newExternalLink.title || newExternalLink.url ? (
                                <Input
                                    placeholder="Description (optional)"
                                    value={newExternalLink.description}
                                    onChange={(e) => setNewExternalLink({ ...newExternalLink, description: e.target.value })}
                                />
                            ) : null}
                        </div>

                        {externalLinks.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Added External Links</h4>
                                <div className="space-y-2">
                                    {externalLinks.map((link, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center space-x-2">
                                                <Globe className="h-8 w-8 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-medium">{link.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                        {link.url}
                                                    </p>
                                                    {link.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {link.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Select
                                                    value="supplier_external_link"
                                                    disabled
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue placeholder="Document Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="supplier_external_link">
                                                            External Document Link
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveExternalLink(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-between pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <div className="space-x-2">
                        <Button
                            type="submit"
                            variant="default"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save & Close"}
                        </Button>
                        <Button
                            type="submit"
                            variant="accent"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save & Start Qualification →"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}