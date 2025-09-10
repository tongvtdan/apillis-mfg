import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Building2,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Supplier, SupplierSpecialty } from "@/types/supplier";

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'total_quotes_sent' | 'total_quotes_received' | 'average_turnaround_days'>) => void;
    supplier?: Supplier | null;
}

const SPECIALTY_OPTIONS: { value: SupplierSpecialty; label: string }[] = [
    { value: 'machining', label: 'Machining' },
    { value: 'fabrication', label: 'Fabrication' },
    { value: 'casting', label: 'Casting' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'injection_molding', label: 'Injection Molding' },
    { value: 'assembly', label: 'Assembly' },
    { value: '3d_printing', label: '3D Printing' },
    { value: 'prototyping', label: 'Prototyping' },
    { value: 'coating', label: 'Coating' },
    { value: 'painting', label: 'Painting' },
    { value: 'welding', label: 'Welding' },
    { value: 'sheet_metal', label: 'Sheet Metal' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'testing', label: 'Testing' },
    { value: 'packaging', label: 'Packaging' },
];

export function SupplierModal({ isOpen, onClose, onSubmit, supplier }: SupplierModalProps) {
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [specialties, setSpecialties] = useState<SupplierSpecialty[]>([]);
    const [rating, setRating] = useState(0);
    const [responseRate, setResponseRate] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState("");

    const { toast } = useToast();

    // Reset form when supplier changes or modal opens
    useEffect(() => {
        if (supplier) {
            setName(supplier.name || "");
            setCompany(supplier.company || "");
            setEmail(supplier.email || "");
            setPhone(supplier.phone || "");
            setAddress(supplier.address || "");
            setCountry(supplier.country || "");
            setSpecialties(supplier.specialties || []);
            setRating(supplier.rating || 0);
            setResponseRate(supplier.response_rate || 0);
            setIsActive(supplier.is_active);
            setNotes(supplier.notes || "");
            setTags(supplier.tags?.join(", ") || "");
        } else {
            // Reset to default values for new supplier
            setName("");
            setCompany("");
            setEmail("");
            setPhone("");
            setAddress("");
            setCountry("");
            setSpecialties([]);
            setRating(0);
            setResponseRate(0);
            setIsActive(true);
            setNotes("");
            setTags("");
        }
    }, [supplier, isOpen]);

    const handleSpecialtyChange = (specialty: SupplierSpecialty, checked: boolean) => {
        if (checked) {
            setSpecialties(prev => [...prev, specialty]);
        } else {
            setSpecialties(prev => prev.filter(s => s !== specialty));
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Supplier name is required.",
            });
            return;
        }

        const supplierData = {
            name: name.trim(),
            company: company.trim() || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
            country: country.trim() || undefined,
            specialties,
            rating,
            response_rate: responseRate,
            is_active: isActive,
            notes: notes.trim() || undefined,
            tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        };

        onSubmit(supplierData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {supplier ? "Edit Supplier" : "Add New Supplier"}
                </div>
            }
            description={
                supplier
                    ? "Update the supplier information below."
                    : "Enter the details for the new supplier."
            }
            showDescription={true}
            maxWidth="max-w-2xl"
        >

            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Name *
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Supplier contact name"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">
                        Company
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Company name"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="supplier@example.com"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                        Phone
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                        Address
                    </Label>
                    <div className="col-span-3">
                        <Textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street address"
                            className="modal-form-textarea resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="country" className="text-right">
                        Country
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                        Specialties
                    </Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        {SPECIALTY_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`specialty-${option.value}`}
                                    checked={specialties.includes(option.value)}
                                    onCheckedChange={(checked) =>
                                        handleSpecialtyChange(option.value, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`specialty-${option.value}`} className="font-normal">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rating" className="text-right">
                        Rating
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={rating}
                            onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="modal-form-input"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Rating from 0.0 to 5.0
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="responseRate" className="text-right">
                        Response Rate
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="responseRate"
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={responseRate}
                            onChange={(e) => setResponseRate(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="modal-form-input"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Percentage from 0 to 100
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                        Status
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                        <Checkbox
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={(checked) => setIsActive(checked as boolean)}
                        />
                        <Label htmlFor="isActive" className="font-normal">
                            Active Supplier
                        </Label>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                        Notes
                    </Label>
                    <div className="col-span-3">
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes about this supplier"
                            className="modal-form-textarea resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">
                        Tags
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="tag1, tag2, tag3"
                            className="modal-form-input"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Comma-separated tags
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose} className="modal-button-secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} className="modal-button-primary" variant="accent">
                    {supplier ? "Update Supplier" : "Add Supplier"}
                </Button>
            </div>
        </Modal>
    );
}