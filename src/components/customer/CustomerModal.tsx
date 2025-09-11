import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X, Building2 } from 'lucide-react';
import { Organization } from '@/types/project';
import { useCustomerOrganizations } from '@/features/customer-management/hooks/useCustomerOrganizations';
import { cn } from '@/lib/utils';

interface CustomerModalProps {
    open: boolean;
    onClose: () => void;
    customer?: Organization | null;
    onSuccess?: (customer: Organization) => void;
}

interface CustomerFormData {
    company_name: string;
    slug: string;
    description: string;
    industry: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    website: string;
}

const COUNTRIES = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Belgium',
    'Switzerland',
    'Austria',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Australia',
    'New Zealand',
    'Japan',
    'South Korea',
    'Singapore',
    'China',
    'India',
    'Brazil',
    'Mexico',
    'Vietnam',
    'Other'
];

const INDUSTRIES = [
    'Technology',
    'Manufacturing',
    'Automotive',
    'Aerospace',
    'Healthcare',
    'Pharmaceuticals',
    'Electronics',
    'Telecommunications',
    'Energy',
    'Oil & Gas',
    'Construction',
    'Agriculture',
    'Food & Beverage',
    'Textiles',
    'Chemicals',
    'Mining',
    'Transportation',
    'Logistics',
    'Retail',
    'Finance',
    'Insurance',
    'Real Estate',
    'Education',
    'Government',
    'Non-Profit',
    'Consulting',
    'Media',
    'Entertainment',
    'Sports',
    'Other'
];

export function CustomerModal({ open, onClose, customer, onSuccess }: CustomerModalProps) {
    const [loading, setLoading] = useState(false);
    const [industryOpen, setIndustryOpen] = useState(false);
    const [customIndustry, setCustomIndustry] = useState('');
    const { createOrganization } = useCustomerOrganizations();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<CustomerFormData>({
        mode: 'onChange',
        defaultValues: {
            company_name: '',
            slug: '',
            description: '',
            industry: '',
            contact_name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postal_code: '',
            website: ''
        }
    });

    const isEditing = !!customer;

    // Helper function to generate slug from company name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Watch company name to auto-generate slug
    const companyName = watch('company_name');
    useEffect(() => {
        if (companyName && !isEditing) {
            const slug = generateSlug(companyName);
            setValue('slug', slug);
        }
    }, [companyName, setValue, isEditing]);

    useEffect(() => {
        if (customer) {
            reset({
                company_name: customer.name || '',
                slug: customer.slug || '',
                description: customer.description || '',
                industry: customer.industry || '',
                contact_name: '', // Contact info is separate
                email: '', // Contact info is separate
                phone: '', // Contact info is separate
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                country: customer.country || '',
                postal_code: customer.postal_code || '',
                website: customer.website || ''
            });
        } else {
            reset({
                company_name: '',
                slug: '',
                description: '',
                industry: '',
                contact_name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                country: '',
                postal_code: '',
                website: ''
            });
        }
    }, [customer, reset]);

    const onSubmit = async (data: CustomerFormData) => {
        try {
            setLoading(true);

            const organizationData = {
                name: data.company_name.trim(),
                slug: data.slug.trim() || undefined,
                description: data.description.trim() || undefined,
                industry: data.industry.trim() || undefined,
                address: data.address.trim() || undefined,
                city: data.city.trim() || undefined,
                state: data.state.trim() || undefined,
                country: data.country || undefined,
                postal_code: data.postal_code.trim() || undefined,
                website: data.website.trim() || undefined,
                organization_type: 'customer' as const
            };

            const contactData = {
                contact_name: data.contact_name.trim() || undefined,
                email: data.email.trim() || undefined,
                phone: data.phone.trim() || undefined,
                is_primary_contact: true
            };

            if (isEditing && customer) {
                // For now, we'll only support creating new organizations
                // TODO: Implement update functionality
                throw new Error('Editing organizations is not yet supported');
            } else {
                const newOrganization = await createOrganization(organizationData, contactData);
                onSuccess?.(newOrganization);
            }

            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title={
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </div>
            }
            description={
                isEditing
                    ? 'Update customer information and contact details.'
                    : 'Add a new customer to your database with their contact information. A primary contact will be created automatically.'
            }
            showDescription={true}
            maxWidth="max-w-[600px]"
        >

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name *</Label>
                        <Input
                            id="company_name"
                            {...register('company_name', {
                                required: 'Company name is required',
                                minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                            })}
                            placeholder="Acme Manufacturing"
                            className="modal-form-input"
                        />
                        {errors.company_name && (
                            <p className="text-sm text-destructive">{errors.company_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            {...register('slug')}
                            placeholder="acme-manufacturing"
                            className="modal-form-input"
                        />
                        <p className="text-xs text-muted-foreground">URL-friendly identifier (auto-generated from company name)</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Brief description of the company and its business..."
                        rows={3}
                        className="modal-form-textarea"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Industry</Label>
                    <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={industryOpen}
                                className="w-full justify-between modal-form-input"
                            >
                                {watch('industry') || "Select industry..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search industry..." />
                                <CommandList>
                                    <CommandEmpty>
                                        <div className="p-2">
                                            <Input
                                                placeholder="Add custom industry..."
                                                value={customIndustry}
                                                onChange={(e) => setCustomIndustry(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customIndustry.trim()) {
                                                        setValue('industry', customIndustry.trim());
                                                        setIndustryOpen(false);
                                                        setCustomIndustry('');
                                                    }
                                                }}
                                            />
                                        </div>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {INDUSTRIES.map((industry) => (
                                            <CommandItem
                                                key={industry}
                                                value={industry}
                                                onSelect={() => {
                                                    setValue('industry', industry);
                                                    setIndustryOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        watch('industry') === industry ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {industry}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {watch('industry') && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {watch('industry')}
                            </Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setValue('industry', '')}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Organization Address Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                        Organization Address & Website
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Company address and website information for the organization.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Organization Address</Label>
                    <Textarea
                        id="address"
                        {...register('address')}
                        placeholder="123 Industrial Ave"
                        rows={2}
                        className="modal-form-textarea"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            {...register('city')}
                            placeholder="Detroit"
                            className="modal-form-input"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                            id="state"
                            {...register('state')}
                            placeholder="MI"
                            className="modal-form-input"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                            id="postal_code"
                            {...register('postal_code')}
                            placeholder="48201"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                            value={watch('country')}
                            onValueChange={(value) => setValue('country', value)}
                        >
                            <SelectTrigger className="modal-select-trigger">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Organization Website</Label>
                        <Input
                            id="website"
                            type="url"
                            {...register('website')}
                            placeholder="https://acme.com"
                            className="modal-form-input"
                        />
                    </div>
                </div>

                {/* Primary Contact Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                        Primary Contact Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        This contact will be set as the main point of contact for this customer organization.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact_name">Primary Contact Name</Label>
                        <Input
                            id="contact_name"
                            {...register('contact_name')}
                            placeholder="John Smith"
                            className="modal-form-input"
                        />

                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Primary Contact Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email', {
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                            placeholder="john@acme.com"
                            className="modal-form-input"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}

                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Primary Contact Phone</Label>
                        <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="+1-555-0123"
                            className="modal-form-input"
                        />

                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="modal-button-secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isValid || loading}
                        className="modal-button-primary"
                        variant="accent"
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Add Customer')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}