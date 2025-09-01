import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Customer } from '@/types/project';
import { useCustomers, CreateCustomerRequest } from '@/hooks/useCustomers';

interface CustomerModalProps {
    open: boolean;
    onClose: () => void;
    customer?: Customer | null;
}

interface CustomerFormData {
    company_name: string;
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

export function CustomerModal({ open, onClose, customer }: CustomerModalProps) {
    const [loading, setLoading] = useState(false);
    const { createCustomer, updateCustomer } = useCustomers();

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

    useEffect(() => {
        if (customer) {
            reset({
                company_name: customer.company_name || '',
                contact_name: customer.contact_name || '',
                email: customer.email || '',
                phone: customer.phone || '',
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

            const customerData: CreateCustomerRequest = {
                company_name: data.company_name.trim(),
                contact_name: data.contact_name.trim() || undefined,
                email: data.email.trim() || undefined,
                phone: data.phone.trim() || undefined,
                address: data.address.trim() || undefined,
                city: data.city.trim() || undefined,
                state: data.state.trim() || undefined,
                country: data.country || undefined,
                postal_code: data.postal_code.trim() || undefined,
                website: data.website.trim() || undefined
            };

            if (isEditing && customer) {
                await updateCustomer(customer.id, customerData);
            } else {
                await createCustomer(customerData);
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
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] modal-dialog">
                <DialogHeader className="modal-dialog-header">
                    <DialogTitle className="modal-dialog-title">
                        {isEditing ? 'Edit Customer' : 'Add New Customer'}
                    </DialogTitle>
                    <DialogDescription className="modal-dialog-description">
                        {isEditing
                            ? 'Update customer information and contact details.'
                            : 'Add a new customer to your database with their contact information.'
                        }
                    </DialogDescription>
                </DialogHeader>

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
                            <Label htmlFor="contact_name">Contact Name</Label>
                            <Input
                                id="contact_name"
                                {...register('contact_name')}
                                placeholder="John Smith"
                                className="modal-form-input"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
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
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="+1-555-0123"
                                className="modal-form-input"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
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
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                {...register('website')}
                                placeholder="https://acme.com"
                                className="modal-form-input"
                            />
                        </div>
                    </div>

                    <DialogFooter>
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}