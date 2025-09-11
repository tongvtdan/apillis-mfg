import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Search, Plus, User, Building } from 'lucide-react';
import { IntakeFormData, ContactInfoSectionProps } from '../../types/intake.types';
import { useIntakeCustomers } from '../../hooks/useIntakeCustomers';

export function ContactInfoSection({
    form,
    collapsed,
    onToggle
}: ContactInfoSectionProps) {

    const {
        customerSearchOpen,
        customerSearchQuery,
        customerSearchLoading,
        customerSearchResults,
        customerCreationOpen,
        customerCreationLoading,
        contactSearchOpen,
        selectedContacts,
        contactSearchLoading,
        organizationContacts,
        customerError,
        setCustomerSearchOpen,
        setCustomerSearchQuery,
        setCustomerCreationOpen,
        setContactSearchOpen,
        searchCustomers,
        selectCustomer,
        createCustomer,
        toggleContact,
        clearErrors
    } = useIntakeCustomers();

    const [customerFormData, setCustomerFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: '',
        website: ''
    });

    // Handle customer search
    const handleCustomerSearch = (query: string) => {
        setCustomerSearchQuery(query);
        if (query.length >= 2) {
            searchCustomers(query);
        }
    };

    // Handle customer selection
    const handleCustomerSelect = (customer: any) => {
        const selectedCustomer = selectCustomer(customer);

        // Update form with selected customer data
        form.setValue('customerName', selectedCustomer.name);
        form.setValue('company', selectedCustomer.company);
        form.setValue('email', selectedCustomer.email);
        form.setValue('phone', selectedCustomer.phone || '');
        form.setValue('country', selectedCustomer.country || '');
        form.setValue('website', selectedCustomer.website || '');
    };

    // Handle customer creation
    const handleCustomerCreation = async () => {
        const customer = await createCustomer(customerFormData);
        if (customer) {
            // Update form with created customer data
            form.setValue('customerName', customer.name);
            form.setValue('company', customer.company);
            form.setValue('email', customer.email);
            form.setValue('phone', customer.phone || '');
            form.setValue('country', customer.country || '');
            form.setValue('website', customer.website || '');

            // Reset form
            setCustomerFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                country: '',
                website: ''
            });
        }
    };

    if (collapsed) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Button
                        variant="ghost"
                        onClick={onToggle}
                        className="w-full justify-between p-0 h-auto"
                    >
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <Button
                    variant="ghost"
                    onClick={onToggle}
                    className="w-full justify-between p-0 h-auto"
                >
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                    <ChevronUp className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Customer Search */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="customer-search">Customer</Label>
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCustomerSearchOpen(true)}
                            >
                                <Search className="h-4 w-4 mr-1" />
                                Search
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCustomerCreationOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                New
                            </Button>
                        </div>
                    </div>

                    {/* Customer Search Modal */}
                    {customerSearchOpen && (
                        <Card className="border-2 border-dashed">
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Search customers by name, company, or email..."
                                        value={customerSearchQuery}
                                        onChange={(e) => handleCustomerSearch(e.target.value)}
                                    />

                                    {customerSearchLoading && (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                        </div>
                                    )}

                                    {customerSearchResults.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {customerSearchResults.map((customer) => (
                                                <Button
                                                    key={customer.id}
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                    onClick={() => handleCustomerSelect(customer)}
                                                >
                                                    <div className="flex items-start space-x-3 w-full">
                                                        <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        <div className="text-left flex-1 min-w-0">
                                                            <div className="font-medium truncate">{customer.name}</div>
                                                            <div className="text-sm text-muted-foreground truncate">
                                                                {customer.company}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {customer.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCustomerSearchOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Creation Modal */}
                    {customerCreationOpen && (
                        <Card className="border-2 border-dashed">
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Create New Customer</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-customer-name">Name *</Label>
                                            <Input
                                                id="new-customer-name"
                                                placeholder="Contact person name"
                                                value={customerFormData.name}
                                                onChange={(e) => setCustomerFormData(prev => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-customer-company">Company *</Label>
                                            <Input
                                                id="new-customer-company"
                                                placeholder="Company name"
                                                value={customerFormData.company}
                                                onChange={(e) => setCustomerFormData(prev => ({
                                                    ...prev,
                                                    company: e.target.value
                                                }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-customer-email">Email *</Label>
                                            <Input
                                                id="new-customer-email"
                                                type="email"
                                                placeholder="contact@company.com"
                                                value={customerFormData.email}
                                                onChange={(e) => setCustomerFormData(prev => ({
                                                    ...prev,
                                                    email: e.target.value
                                                }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-customer-phone">Phone</Label>
                                            <Input
                                                id="new-customer-phone"
                                                placeholder="+1 (555) 123-4567"
                                                value={customerFormData.phone}
                                                onChange={(e) => setCustomerFormData(prev => ({
                                                    ...prev,
                                                    phone: e.target.value
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCustomerCreationOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCustomerCreation}
                                            disabled={customerCreationLoading || !customerFormData.name || !customerFormData.company || !customerFormData.email}
                                        >
                                            {customerCreationLoading ? 'Creating...' : 'Create Customer'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Customer Information Form */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer-name">Contact Name *</Label>
                        <Input
                            id="customer-name"
                            placeholder="John Doe"
                            {...form.register('customerName')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                            id="company"
                            placeholder="ABC Corporation"
                            {...form.register('company')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@company.com"
                            {...form.register('email')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            {...form.register('phone')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            placeholder="United States"
                            {...form.register('country')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            placeholder="https://company.com"
                            {...form.register('website')}
                        />
                    </div>
                </div>

                {/* Point of Contacts */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Point of Contacts</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setContactSearchOpen(true)}
                        >
                            <User className="h-4 w-4 mr-1" />
                            Select Contacts
                        </Button>
                    </div>

                    {selectedContacts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedContacts.map((contactId) => {
                                const contact = organizationContacts.find(c => c.id === contactId);
                                return (
                                    <Badge key={contactId} variant="secondary">
                                        {contact?.name || 'Unknown Contact'}
                                    </Badge>
                                );
                            })}
                        </div>
                    )}

                    {/* Contact Selection Modal */}
                    {contactSearchOpen && (
                        <Card className="border-2 border-dashed">
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Select Point of Contacts</h4>

                                    {contactSearchLoading ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {organizationContacts.map((contact) => (
                                                <Button
                                                    key={contact.id}
                                                    variant={selectedContacts.includes(contact.id) ? "default" : "outline"}
                                                    className="w-full justify-start"
                                                    onClick={() => toggleContact(contact.id)}
                                                >
                                                    <div className="flex items-start space-x-3 w-full">
                                                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        <div className="text-left flex-1 min-w-0">
                                                            <div className="font-medium truncate">{contact.name}</div>
                                                            <div className="text-sm text-muted-foreground truncate">
                                                                {contact.email}
                                                            </div>
                                                            {contact.position && (
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {contact.position}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setContactSearchOpen(false)}
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {customerError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        {customerError}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
