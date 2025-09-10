import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/core/auth';
import {
    Users,
    Plus,
    Search,
    Filter,
    Star,
    TrendingUp,
    FileText,
    Phone,
    Mail,
    MapPin,
    Calendar,
    DollarSign,
    BarChart3,
    UserPlus,
    Activity,
    Download,
    Edit,
    Trash2,
    Eye
} from 'lucide-react';
import {
    Customer,
    Contact,
    CustomerInteraction,
    CUSTOMER_STATUS_CONFIG,
    CUSTOMER_TYPE_CONFIG,
    CUSTOMER_TIER_CONFIG,
    CONTACT_RELATIONSHIP_CONFIG,
    customerSchema,
    contactSchema,
    customerInteractionSchema
} from '../types/customer-management.types';
import { CustomerManagementService } from '../services/customerManagementService';

interface CustomerManagementProps {
    onCustomerSelect?: (customer: Customer) => void;
    onContactCreate?: (contact: Contact) => void;
    defaultTab?: 'customers' | 'contacts' | 'analytics';
}

export function CustomerManagement({
    onCustomerSelect,
    onContactCreate,
    defaultTab = 'customers'
}: CustomerManagementProps) {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Customer form
    const customerForm = useForm<Customer>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            customerType: 'business',
            status: 'prospect',
            currency: 'USD',
            tags: [],
            billingAddress: {
                street: '',
                city: '',
                country: 'USA'
            }
        }
    });

    // Contact form
    const contactForm = useForm<Contact>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            relationship: 'primary',
            isPrimary: false,
            preferredCommunication: 'email',
            isActive: true
        }
    });

    // Interaction form
    const interactionForm = useForm<CustomerInteraction>({
        resolver: zodResolver(customerInteractionSchema),
        defaultValues: {
            type: 'call',
            direction: 'outbound'
        }
    });

    // Load initial data
    useEffect(() => {
        loadCustomers();
    }, [profile?.organization_id]);

    // Load customer-specific data when customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            loadCustomerContacts(selectedCustomer.id);
            loadCustomerInteractions(selectedCustomer.id);
        }
    }, [selectedCustomer]);

    const loadCustomers = async () => {
        if (!profile?.organization_id) return;

        setLoading(true);
        try {
            const result = await CustomerManagementService.searchCustomers({}, profile.organization_id);
            setCustomers(result.customers);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomerContacts = async (customerId: string) => {
        try {
            const customerContacts = await CustomerManagementService.getCustomerContacts(customerId);
            setContacts(customerContacts);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        }
    };

    const loadCustomerInteractions = async (customerId: string) => {
        try {
            const customerInteractions = await CustomerManagementService.getCustomerInteractions(customerId);
            setInteractions(customerInteractions);
        } catch (error) {
            console.error('Failed to load interactions:', error);
        }
    };

    const handleCreateCustomer = async (data: Customer) => {
        if (!user?.id) return;

        try {
            await CustomerManagementService.createCustomer(data, user.id);
            customerForm.reset();
            loadCustomers();
            alert('Customer created successfully!');
        } catch (error) {
            console.error('Failed to create customer:', error);
            alert('Failed to create customer');
        }
    };

    const handleCreateContact = async (data: Contact) => {
        if (!user?.id || !selectedCustomer) return;

        try {
            const contact = await CustomerManagementService.createContact({
                ...data,
                customerId: selectedCustomer.id,
                organizationId: profile?.organization_id || ''
            }, user.id);

            loadCustomerContacts(selectedCustomer.id);
            contactForm.reset();
            onContactCreate?.(contact);
            alert('Contact created successfully!');
        } catch (error) {
            console.error('Failed to create contact:', error);
            alert('Failed to create contact');
        }
    };

    const handleLogInteraction = async (data: CustomerInteraction) => {
        if (!user?.id || !selectedCustomer) return;

        try {
            await CustomerManagementService.logInteraction({
                ...data,
                customerId: selectedCustomer.id,
                contactId: contacts.find(c => c.isPrimary)?.id,
                organizationId: profile?.organization_id || '',
                createdBy: user.id
            }, user.id);

            loadCustomerInteractions(selectedCustomer.id);
            interactionForm.reset();
            alert('Interaction logged successfully!');
        } catch (error) {
            console.error('Failed to log interaction:', error);
            alert('Failed to log interaction');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportCustomers = () => {
        const exportData = CustomerManagementService.exportCustomerData(customers);

        // Download CSV
        const csvBlob = new Blob([exportData.csv], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = 'customers.csv';
        csvLink.click();

        // Download JSON
        const jsonBlob = new Blob([exportData.json], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        jsonLink.href = jsonUrl;
        jsonLink.download = 'customers.json';
        jsonLink.click();

        URL.revokeObjectURL(csvUrl);
        URL.revokeObjectURL(jsonUrl);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <Users className="h-6 w-6" />
                                <span>Customer Management</span>
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                                Comprehensive customer lifecycle management and analytics
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                                {customers.length} Customers
                            </Badge>
                            <Button variant="outline" onClick={exportCustomers}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Customer Directory</span>
                                    <div className="flex space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search customers..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 w-48"
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="prospect">Prospect</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-2">Loading customers...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {filteredCustomers.map((customer) => (
                                            <Card
                                                key={customer.id}
                                                className={`p-3 cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    onCustomerSelect?.(customer);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium">{customer.name}</h4>
                                                            <Badge className={CUSTOMER_TYPE_CONFIG[customer.customerType].color}>
                                                                {CUSTOMER_TYPE_CONFIG[customer.customerType].icon}
                                                                {CUSTOMER_TYPE_CONFIG[customer.customerType].label}
                                                            </Badge>
                                                            {customer.customerTier && (
                                                                <Badge className={CUSTOMER_TIER_CONFIG[customer.customerTier].color}>
                                                                    {CUSTOMER_TIER_CONFIG[customer.customerTier].label}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge className={CUSTOMER_STATUS_CONFIG[customer.status].color}>
                                                                {CUSTOMER_STATUS_CONFIG[customer.status].label}
                                                            </Badge>
                                                            <div className="flex items-center text-xs text-muted-foreground">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {customer.billingAddress?.city}, {customer.billingAddress?.country}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {customer.annualRevenue && (
                                                            <div className="text-right">
                                                                <div className="text-sm font-medium">
                                                                    ${(customer.annualRevenue / 1000).toFixed(0)}K
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">Revenue</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Details / Create */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedCustomer ? 'Customer Details' : 'Create New Customer'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCustomer ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Name</Label>
                                                <p className="text-sm">{selectedCustomer.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Type</Label>
                                                <Badge className={CUSTOMER_TYPE_CONFIG[selectedCustomer.customerType].color}>
                                                    {CUSTOMER_TYPE_CONFIG[selectedCustomer.customerType].label}
                                                </Badge>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Email</Label>
                                                <p className="text-sm">{selectedCustomer.email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Phone</Label>
                                                <p className="text-sm">{selectedCustomer.phone || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Status</Label>
                                                <Badge className={CUSTOMER_STATUS_CONFIG[selectedCustomer.status].color}>
                                                    {CUSTOMER_STATUS_CONFIG[selectedCustomer.status].label}
                                                </Badge>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Tier</Label>
                                                <Badge className={CUSTOMER_TIER_CONFIG[selectedCustomer.customerTier || 'bronze'].color}>
                                                    {CUSTOMER_TIER_CONFIG[selectedCustomer.customerTier || 'bronze'].label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Address</Label>
                                            <p className="text-sm">
                                                {selectedCustomer.billingAddress?.street}<br />
                                                {selectedCustomer.billingAddress?.city}, {selectedCustomer.billingAddress?.state} {selectedCustomer.billingAddress?.postalCode}<br />
                                                {selectedCustomer.billingAddress?.country}
                                            </p>
                                        </div>

                                        <div className="flex space-x-2 pt-4">
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <Activity className="h-4 w-4 mr-1" />
                                                View Activity
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={customerForm.handleSubmit(handleCreateCustomer)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-name">Customer Name *</Label>
                                                <Input
                                                    id="customer-name"
                                                    {...customerForm.register('name')}
                                                    placeholder="ABC Corporation"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-type">Type *</Label>
                                                <Select
                                                    value={customerForm.watch('customerType')}
                                                    onValueChange={(value) => customerForm.setValue('customerType', value as any)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(CUSTOMER_TYPE_CONFIG).map(([key, config]) => (
                                                            <SelectItem key={key} value={key}>
                                                                <div className="flex items-center space-x-2">
                                                                    <span>{config.icon}</span>
                                                                    <span>{config.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-email">Email *</Label>
                                                <Input
                                                    id="customer-email"
                                                    type="email"
                                                    {...customerForm.register('email')}
                                                    placeholder="contact@company.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-phone">Phone</Label>
                                                <Input
                                                    id="customer-phone"
                                                    {...customerForm.register('phone')}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer-address">Address *</Label>
                                            <Textarea
                                                id="customer-address"
                                                {...customerForm.register('billingAddress.street')}
                                                placeholder="123 Main Street"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-city">City *</Label>
                                                <Input
                                                    id="customer-city"
                                                    {...customerForm.register('billingAddress.city')}
                                                    placeholder="Springfield"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-state">State</Label>
                                                <Input
                                                    id="customer-state"
                                                    {...customerForm.register('billingAddress.state')}
                                                    placeholder="IL"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-country">Country *</Label>
                                                <Input
                                                    id="customer-country"
                                                    {...customerForm.register('billingAddress.country')}
                                                    placeholder="USA"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Customer
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Contacts Tab */}
                <TabsContent value="contacts" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contacts List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedCustomer ? `Contacts - ${selectedCustomer.name}` : 'Select a Customer First'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCustomer ? (
                                    <div className="space-y-3">
                                        {contacts.map((contact) => (
                                            <Card key={contact.id} className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium">
                                                                {contact.firstName} {contact.lastName}
                                                            </h4>
                                                            {contact.isPrimary && (
                                                                <Badge variant="secondary">Primary</Badge>
                                                            )}
                                                            <Badge className={CONTACT_RELATIONSHIP_CONFIG[contact.relationship].color}>
                                                                {CONTACT_RELATIONSHIP_CONFIG[contact.relationship].icon}
                                                                {CONTACT_RELATIONSHIP_CONFIG[contact.relationship].label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                                                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                                                        {contact.title && (
                                                            <p className="text-xs text-muted-foreground">{contact.title}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Button size="sm" variant="outline">
                                                            <Phone className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Select a customer to view their contacts</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Create Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Contact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCustomer ? (
                                    <form onSubmit={contactForm.handleSubmit(handleCreateContact)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-first-name">First Name *</Label>
                                                <Input
                                                    id="contact-first-name"
                                                    {...contactForm.register('firstName')}
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-last-name">Last Name *</Label>
                                                <Input
                                                    id="contact-last-name"
                                                    {...contactForm.register('lastName')}
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact-email">Email *</Label>
                                            <Input
                                                id="contact-email"
                                                type="email"
                                                {...contactForm.register('email')}
                                                placeholder="john.doe@company.com"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-phone">Phone</Label>
                                                <Input
                                                    id="contact-phone"
                                                    {...contactForm.register('phone')}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-relationship">Relationship *</Label>
                                                <Select
                                                    value={contactForm.watch('relationship')}
                                                    onValueChange={(value) => contactForm.setValue('relationship', value as any)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(CONTACT_RELATIONSHIP_CONFIG).map(([key, config]) => (
                                                            <SelectItem key={key} value={key}>
                                                                <div className="flex items-center space-x-2">
                                                                    <span>{config.icon}</span>
                                                                    <span>{config.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact-title">Title</Label>
                                            <Input
                                                id="contact-title"
                                                {...contactForm.register('title')}
                                                placeholder="Senior Manager"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is-primary"
                                                checked={contactForm.watch('isPrimary')}
                                                onCheckedChange={(checked) => contactForm.setValue('isPrimary', checked as boolean)}
                                            />
                                            <Label htmlFor="is-primary">Set as primary contact</Label>
                                        </div>

                                        <Button type="submit" className="w-full">
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Create Contact
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Select a customer to add contacts</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5" />
                                <span>Customer Analytics</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedCustomer ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card className="p-4">
                                            <div className="text-center">
                                                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                                <div className="text-2xl font-bold">$125K</div>
                                                <div className="text-sm text-muted-foreground">Total Revenue</div>
                                            </div>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="text-center">
                                                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                                <div className="text-2xl font-bold">23</div>
                                                <div className="text-sm text-muted-foreground">Active Projects</div>
                                            </div>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="text-center">
                                                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                                                <div className="text-2xl font-bold">4.6</div>
                                                <div className="text-sm text-muted-foreground">Satisfaction</div>
                                            </div>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="text-center">
                                                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                                <div className="text-2xl font-bold">7</div>
                                                <div className="text-sm text-muted-foreground">Days Since Last Contact</div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Recent Interactions</h4>
                                        {interactions.slice(0, 5).map((interaction) => (
                                            <Card key={interaction.id} className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline">{interaction.type}</Badge>
                                                            <span className="font-medium">{interaction.subject}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {interaction.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(interaction.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a customer to view analytics</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
