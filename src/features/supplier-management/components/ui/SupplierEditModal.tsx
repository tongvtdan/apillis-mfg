import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, X } from 'lucide-react';

const supplierEditSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    country: z.string().optional(),
    supplierType: z.enum(['manufacturer', 'distributor', 'service_provider', 'raw_material', 'component']).optional(),
    paymentTerms: z.string().optional(),
    annualSpend: z.number().min(0).optional(),
    specialties: z.array(z.string()).optional(),
    capabilities: z.array(z.string()).optional(),
});

type SupplierEditFormData = z.infer<typeof supplierEditSchema>;

interface Supplier {
    id: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    website?: string;
    country?: string;
    supplierType?: string;
    paymentTerms?: string;
    annualSpend?: number;
    specialties?: string[];
    capabilities?: string[];
    status?: string;
}

interface SupplierEditModalProps {
    supplier: Supplier;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedSupplier: Supplier) => void;
}

export function SupplierEditModal({
    supplier,
    isOpen,
    onClose,
    onSave
}: SupplierEditModalProps) {
    const [specialties, setSpecialties] = useState<string[]>(supplier.specialties || []);
    const [capabilities, setCapabilities] = useState<string[]>(supplier.capabilities || []);
    const [newSpecialty, setNewSpecialty] = useState('');
    const [newCapability, setNewCapability] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm<SupplierEditFormData>({
        resolver: zodResolver(supplierEditSchema),
        defaultValues: {
            name: supplier.name,
            company: supplier.company || '',
            email: supplier.email,
            phone: supplier.phone || '',
            website: supplier.website || '',
            country: supplier.country || '',
            supplierType: supplier.supplierType as any || '',
            paymentTerms: supplier.paymentTerms || '',
            annualSpend: supplier.annualSpend || 0,
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: supplier.name,
                company: supplier.company || '',
                email: supplier.email,
                phone: supplier.phone || '',
                website: supplier.website || '',
                country: supplier.country || '',
                supplierType: supplier.supplierType as any || '',
                paymentTerms: supplier.paymentTerms || '',
                annualSpend: supplier.annualSpend || 0,
            });
            setSpecialties(supplier.specialties || []);
            setCapabilities(supplier.capabilities || []);
        }
    }, [isOpen, supplier, reset]);

    const onSubmit = (data: SupplierEditFormData) => {
        const updatedSupplier: Supplier = {
            ...supplier,
            ...data,
            specialties,
            capabilities,
        };
        onSave(updatedSupplier);
    };

    const addSpecialty = () => {
        if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
            setSpecialties([...specialties, newSpecialty.trim()]);
            setNewSpecialty('');
        }
    };

    const removeSpecialty = (specialty: string) => {
        setSpecialties(specialties.filter(s => s !== specialty));
    };

    const addCapability = () => {
        if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
            setCapabilities([...capabilities, newCapability.trim()]);
            setNewCapability('');
        }
    };

    const removeCapability = (capability: string) => {
        setCapabilities(capabilities.filter(c => c !== capability));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Supplier
                </div>
            }
            description="Update supplier information and capabilities"
            showDescription={true}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="Supplier name"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                {...register('company')}
                                placeholder="Company name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="email@example.com"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                {...register('website')}
                                placeholder="https://example.com"
                            />
                            {errors.website && (
                                <p className="text-sm text-red-600">{errors.website.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                {...register('country')}
                                placeholder="Country"
                            />
                        </div>

                        <div>
                            <Label htmlFor="supplierType">Supplier Type</Label>
                            <Select
                                value={watch('supplierType')}
                                onValueChange={(value) => setValue('supplierType', value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                                    <SelectItem value="distributor">Distributor</SelectItem>
                                    <SelectItem value="service_provider">Service Provider</SelectItem>
                                    <SelectItem value="raw_material">Raw Material</SelectItem>
                                    <SelectItem value="component">Component</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="paymentTerms">Payment Terms</Label>
                            <Select
                                value={watch('paymentTerms')}
                                onValueChange={(value) => setValue('paymentTerms', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select terms" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Net 15">Net 15</SelectItem>
                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                    <SelectItem value="Net 45">Net 45</SelectItem>
                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                    <SelectItem value="Net 90">Net 90</SelectItem>
                                    <SelectItem value="COD">COD</SelectItem>
                                    <SelectItem value="CIA">CIA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="annualSpend">Annual Spend ($)</Label>
                            <Input
                                id="annualSpend"
                                type="number"
                                min="0"
                                {...register('annualSpend', { valueAsNumber: true })}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Specialties */}
                <div>
                    <Label>Specialties</Label>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={newSpecialty}
                                onChange={(e) => setNewSpecialty(e.target.value)}
                                placeholder="Add specialty"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                            />
                            <Button type="button" onClick={addSpecialty} variant="outline">
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {specialty}
                                    <button
                                        type="button"
                                        onClick={() => removeSpecialty(specialty)}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Capabilities */}
                <div>
                    <Label>Capabilities</Label>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={newCapability}
                                onChange={(e) => setNewCapability(e.target.value)}
                                placeholder="Add capability"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                            />
                            <Button type="button" onClick={addCapability} variant="outline">
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {capabilities.map((capability, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    {capability}
                                    <button
                                        type="button"
                                        onClick={() => removeCapability(capability)}
                                        className="ml-1 hover:text-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
