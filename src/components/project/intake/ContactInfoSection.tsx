import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Plus, X, Check, ChevronsUpDown, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactInfoSectionProps } from './types';

export function ContactInfoSection({
    form,
    collapsed,
    onToggle,
    organizations,
    organizationsLoading,
    customerSearchOpen,
    setCustomerSearchOpen,
    customerSearchQuery,
    setCustomerSearchQuery,
    filteredOrganizations,
    handleOrganizationSelect,
    organizationContacts,
    loadingContacts,
    selectedContacts,
    pointOfContactsOpen,
    setPointOfContactsOpen,
    handlePointOfContactToggle,
    onCreateCustomer,
    onCreateContact
}: ContactInfoSectionProps) {
    return (
        <Card>
            <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {collapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                            Customer Information
                        </CardTitle>
                        <CardDescription>
                            Select an existing customer organization or create a new one for project communication
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCreateCustomer}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            New Customer
                        </Button>
                    </div>
                </div>
            </CardHeader>
            {!collapsed && (
                <CardContent className="space-y-4">
                    {/* Organization and Point of Contacts Selection - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Organization Selection - Left Side */}
                        <FormField
                            control={form.control}
                            name="selectedCustomerId"
                            render={({ field }) => {
                                const selectedOrg = organizations?.find(org => org.id === field.value);
                                return (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Select Existing Organization (Optional)</FormLabel>
                                            {selectedOrg && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            // TODO: Implement company details popup
                                                            console.log('Company details:', selectedOrg);
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Building2 className="h-3 w-3 mr-1" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={customerSearchOpen}
                                                        className="w-full justify-between"
                                                    >
                                                        {field.value ?
                                                            selectedOrg?.name || "Select organization..."
                                                            : "Select organization..."
                                                        }
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Search organizations..."
                                                        value={customerSearchQuery}
                                                        onValueChange={setCustomerSearchQuery}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {organizationsLoading ? "Loading organizations..." : "No organizations found."}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredOrganizations.map((organization) => (
                                                                <CommandItem
                                                                    key={organization.id}
                                                                    value={organization.id}
                                                                    onSelect={() => handleOrganizationSelect(organization)}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === organization.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{organization.name}</span>
                                                                        {organization.industry && (
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {organization.industry}
                                                                            </span>
                                                                        )}
                                                                        {organization.description && (
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {organization.description}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        {/* Point of Contacts Selection - Right Side */}
                        {form.watch('selectedCustomerId') && (
                            <FormField
                                control={form.control}
                                name="pointOfContacts"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Point of Contacts</FormLabel>
                                            {selectedContacts.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const contacts = selectedContacts.map(id => organizationContacts.find(c => c.id === id)).filter(Boolean);
                                                        console.log('Contact details:', contacts.map(c => `${c.contact_name} - ${c.email}`).join(', '));
                                                    }}
                                                    className="text-xs"
                                                >
                                                    <Building2 className="h-3 w-3 mr-1" />
                                                    View Details
                                                </Button>
                                            )}
                                        </div>
                                        <Popover open={pointOfContactsOpen} onOpenChange={setPointOfContactsOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={pointOfContactsOpen}
                                                        className="w-full justify-between"
                                                    >
                                                        {selectedContacts.length > 0
                                                            ? `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} selected`
                                                            : organizationContacts.length === 0 && !loadingContacts
                                                                ? "No contacts - Add new contact"
                                                                : "Select point of contacts..."
                                                        }
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandGroup>
                                                            {loadingContacts ? (
                                                                <CommandItem disabled>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Loading contacts...
                                                                </CommandItem>
                                                            ) : organizationContacts.length === 0 ? (
                                                                <>
                                                                    <CommandItem disabled>
                                                                        No contacts available
                                                                    </CommandItem>
                                                                    <CommandItem
                                                                        onSelect={() => {
                                                                            onCreateContact();
                                                                            setPointOfContactsOpen(false);
                                                                        }}
                                                                        className="text-primary hover:text-primary"
                                                                    >
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Add new contact
                                                                    </CommandItem>
                                                                </>
                                                            ) : (
                                                                organizationContacts.map((contact) => (
                                                                    <CommandItem
                                                                        key={contact.id}
                                                                        value={contact.id}
                                                                        onSelect={() => handlePointOfContactToggle(contact.id)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                selectedContacts.includes(contact.id) ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium">
                                                                                    {contact.contact_name || 'Unnamed Contact'}
                                                                                </span>
                                                                                {contact.is_primary_contact && (
                                                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                                                                        Primary
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {contact.email || 'No email'}
                                                                            </span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))
                                                            )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {selectedContacts.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {selectedContacts.map(contactId => {
                                                    const contact = organizationContacts.find(c => c.id === contactId);
                                                    return contact ? (
                                                        <Badge
                                                            key={contactId}
                                                            variant={contact.is_primary_contact ? "default" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {contact.contact_name || contact.email}
                                                            {contact.is_primary_contact && (
                                                                <span className="ml-1 text-xs">⭐</span>
                                                            )}
                                                            <X
                                                                className="ml-1 h-3 w-3 cursor-pointer"
                                                                onClick={() => handlePointOfContactToggle(contactId)}
                                                            />
                                                        </Badge>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Placeholder for when no organization is selected */}
                        {!form.watch('selectedCustomerId') && (
                            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-md">
                                <div className="text-center text-muted-foreground">
                                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Select an organization first</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={form.watch('selectedCustomerId') ? "Auto-filled from organization" : "TechNova Inc."}
                                            {...field}
                                            readOnly={!!form.watch('selectedCustomerId')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => {
                                const hasContacts = organizationContacts.length > 0;
                                return (
                                    <FormItem>
                                        <FormLabel>Contact Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={
                                                    !form.watch('selectedCustomerId')
                                                        ? "Select organization first"
                                                        : !hasContacts
                                                            ? "No contacts available - add new contact"
                                                            : "Auto-filled from contact"
                                                }
                                                {...field}
                                                readOnly={hasContacts && selectedContacts.length > 0}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => {
                            const hasContacts = organizationContacts.length > 0;
                            return (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={
                                                !form.watch('selectedCustomerId')
                                                    ? "Select organization first"
                                                    : !hasContacts
                                                        ? "No contacts available - add new contact"
                                                        : "Auto-filled from contact"
                                            }
                                            {...field}
                                            readOnly={hasContacts && selectedContacts.length > 0}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                </CardContent>
            )}
        </Card>
    );
}
