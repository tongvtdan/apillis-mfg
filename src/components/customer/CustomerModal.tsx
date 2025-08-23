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
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    country: string;
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
            name: '',
            company: '',
            email: '',
            phone: '',
            address: '',
            country: ''
        }
    });

    const isEditing = !!customer;

    useEffect(() => {
        if (customer) {
            reset({
                name: customer.name || '',
                company: customer.company || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                country: customer.country || ''
            });
        } else {
            reset({
                name: '',
                company: '',
                email: '',
                phone: '',
                address: '',
                country: ''
            });
        }
    }, [customer, reset]);

    const onSubmit = async (data: CustomerFormData) => {
        try {
            setLoading(true);

            const customerData: CreateCustomerRequest = {
                name: data.name.trim(),
                company: data.company.trim() || undefined,
                email: data.email.trim() || undefined,
                phone: data.phone.trim() || undefined,
                address: data.address.trim() || undefined,
                country: data.country || undefined
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Customer' : 'Add New Customer'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update customer information and contact details.'
                            : 'Add a new customer to your database with their contact information.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                })}
                                placeholder="John Smith"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                {...register('company')}
                                placeholder="Acme Manufacturing"
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
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            {...register('address')}
                            placeholder="123 Industrial Ave, Detroit, MI 48201"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                            value={watch('country')}
                            onValueChange={(value) => setValue('country', value)}
                        >
                            <SelectTrigger>
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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || loading}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Add Customer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}