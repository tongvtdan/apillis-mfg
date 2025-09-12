import { useState } from "react";
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
    Tag
} from "lucide-react";
import { useAuth } from "@/core/auth";
import { useToast } from "@/shared/hooks/use-toast";
import { SupplierSpecialty } from "@/types/supplier";
import { SUPPLIER_TYPE_CONFIG } from "@/features/supplier-management";
import { SupplierManagementService } from "@/features/supplier-management/services/supplierManagementService";

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
    'USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'MXN', 'AUD', 'CHF', 'SEK'
];

const INCOTERMS = [
    'EXW', 'FCA', 'CPT', 'CIP', 'DAT', 'DAP', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'
];

const TOLERANCE_OPTIONS = [
    '±0.001mm',
    '±0.005mm',
    '±0.01mm',
    '±0.05mm',
    '±0.1mm',
    '±0.2mm',
    'Custom'
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
        website: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",

        // Capabilities
        specialties: [] as SupplierSpecialty[],
        materials: [] as string[],
        toleranceCapability: "",
        maxPartLength: "",
        maxPartWidth: "",
        maxPartHeight: "",
        leadTimePrototype: "",
        leadTimeProduction: "",

        // Compliance
        certifications: [] as string[],
        paymentTerms: "Net 30",
        currency: "USD",
        creditLimit: "",
        incoterms: "FOB Origin",

        // Qualification
        startQualification: false,
        qualificationDeadline: "14",

        // Metadata
        tags: [] as string[],
        internalNotes: "",
    });

    const [newTag, setNewTag] = useState("");
    const [newMaterial, setNewMaterial] = useState("");
    const [newProcess, setNewProcess] = useState("");

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
        if (newProcess.trim() && !formData.specialties.includes(newProcess.trim() as SupplierSpecialty)) {
            setFormData(prev => ({
                ...prev,
                specialties: [...prev.specialties, newProcess.trim() as SupplierSpecialty]
            }));
            setNewProcess("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to create a supplier.",
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
                website: formData.website,
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
                creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
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

            toast({
                title: "Success",
                description: "Supplier created successfully!"
            });

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
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Add New Supplier</h1>
                <p className="text-muted-foreground">
                    Onboard a new supplier into your qualified vendor base
                </p>
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
                                />
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1-555-123-4567"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="www.acme-machining.com"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Industrial Blvd"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Torrance"
                                    required
                                />
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
                                    <SelectTrigger>
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {SPECIALTIES.map((specialty) => (
                                    <div key={specialty} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`specialty-${specialty}`}
                                            checked={formData.specialties.includes(specialty)}
                                            onCheckedChange={() => handleSpecialtyChange(specialty)}
                                        />
                                        <Label htmlFor={`specialty-${specialty}`} className="text-sm">
                                            {SPECIALTY_LABELS[specialty]}
                                        </Label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tolerance">Tolerance Capability</Label>
                                <Select
                                    value={formData.toleranceCapability}
                                    onValueChange={(value) => setFormData({ ...formData, toleranceCapability: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tolerance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TOLERANCE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Max Part Size (mm)</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="length" className="text-xs">Length</Label>
                                        <Input
                                            id="length"
                                            type="number"
                                            value={formData.maxPartLength}
                                            onChange={(e) => setFormData({ ...formData, maxPartLength: e.target.value })}
                                            placeholder="500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="width" className="text-xs">Width</Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            value={formData.maxPartWidth}
                                            onChange={(e) => setFormData({ ...formData, maxPartWidth: e.target.value })}
                                            placeholder="500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="height" className="text-xs">Height</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            value={formData.maxPartHeight}
                                            onChange={(e) => setFormData({ ...formData, maxPartHeight: e.target.value })}
                                            placeholder="300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="leadTimePrototype">Lead Time (Prototype) (weeks)</Label>
                                <Input
                                    id="leadTimePrototype"
                                    type="number"
                                    value={formData.leadTimePrototype}
                                    onChange={(e) => setFormData({ ...formData, leadTimePrototype: e.target.value })}
                                    placeholder="2"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="leadTimeProduction">Lead Time (Production) (weeks)</Label>
                                <Input
                                    id="leadTimeProduction"
                                    type="number"
                                    value={formData.leadTimeProduction}
                                    onChange={(e) => setFormData({ ...formData, leadTimeProduction: e.target.value })}
                                    placeholder="4"
                                />
                            </div>
                        </div>
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
                                <Label htmlFor="creditLimit">Credit Limit</Label>
                                <Input
                                    id="creditLimit"
                                    type="number"
                                    value={formData.creditLimit}
                                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                                    placeholder="100000"
                                />
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

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="startQualification"
                                checked={formData.startQualification}
                                onCheckedChange={(checked) => setFormData({ ...formData, startQualification: !!checked })}
                            />
                            <Label htmlFor="startQualification">
                                Start Supplier Qualification Process Now
                            </Label>
                        </div>

                        {formData.startQualification && (
                            <div className="ml-6 space-y-2">
                                <Label htmlFor="qualificationDeadline">Qualification Deadline</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="qualificationDeadline"
                                        type="number"
                                        value={formData.qualificationDeadline}
                                        onChange={(e) => setFormData({ ...formData, qualificationDeadline: e.target.value })}
                                        className="w-20"
                                    />
                                    <span>days from today</span>
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