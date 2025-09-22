import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  TrendingUp,
  MapPin,
  Plus,
  BarChart3
} from 'lucide-react';
import { useCustomerOrganizations } from '@/hooks/useCustomerOrganizations';
import { usePermissions } from '@/core/auth/hooks/usePermissions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CustomerTable } from '@/components/customer/CustomerTableEnhanced';
import { CustomerModal } from '@/components/customer/CustomerModal';
import { ContactModal } from '@/components/customer/ContactModal';
import { CustomerOrganizationWithSummary } from '@/types/project';
import { calculateCustomerStatistics } from '@/utils/customerStatistics';

export default function Customers() {
  const [showArchived, setShowArchived] = useState(false);
  const { customers, loading } = useCustomerOrganizations(showArchived);
  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOrganizationWithSummary | null>(null);
  const [canManageCustomers, setCanManageCustomers] = useState(false);

  const {
    canManageCustomers: checkCanManageCustomers,
    canArchiveCustomers: checkCanArchiveCustomers
  } = usePermissions();

  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      const canManage = await checkCanManageCustomers();
      setCanManageCustomers(canManage);
    };
    checkPermissions();
  }, [checkCanManageCustomers]);

  // Calculate customer statistics
  const stats = calculateCustomerStatistics(customers);
  const { totalCustomers, activeCustomers, archivedCustomers, countries, totalProjects, totalValue, activeProjects } = stats;

  const handleCustomerSelect = (customer: CustomerOrganizationWithSummary) => {
    setSelectedCustomer(customer);
    // Could navigate to customer detail page or show details panel
  };

  const handleAddContact = (customer: CustomerOrganizationWithSummary) => {
    setSelectedCustomer(customer);
    setShowContactModal(true);
  };


  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer database and relationships</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-24"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="bg-muted rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-100 text-base-content min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-base-content">Customer Management</h1>
            <p className="text-base-content/70">Manage your customer database and relationships</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <Label htmlFor="show-archived" className="text-sm">
                Show Archived
              </Label>
            </div>
            {canManageCustomers && (
              <Button
                onClick={() => setShowModal(true)}
                variant="accent"
                className="action-button shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-base-content/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-base-content">{totalCustomers}</div>
            <p className="text-xs text-base-content/70">
              {showArchived ? 'Archived customers' : 'Total active customers'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-base-content/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-base-content">{totalProjects}</div>
            <p className="text-xs text-base-content/70">
              {activeProjects} active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Building2 className="h-4 w-4 text-base-content/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-base-content">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-base-content/70">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <MapPin className="h-4 w-4 text-base-content/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-base-content">{countries}</div>
            <p className="text-xs text-base-content/70">
              Global customer base
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="customers" className="w-full">
        <TabsList>
          <TabsTrigger value="customers">All Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>
                Manage your customer information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerTable
                customers={customers}
                onCustomerSelect={handleCustomerSelect}
                onAddContact={handleAddContact}
                onEdit={(customer) => {
                  setSelectedCustomer(customer);
                  setShowModal(true);
                }}
                canArchive={canManageCustomers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Customer Analytics
              </CardTitle>
              <CardDescription>
                Customer insights and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto text-base-content/70 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-base-content">Analytics Coming Soon</h3>
                <p className="text-base-content/70">
                  Customer analytics and insights will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Modal */}
      <CustomerModal
        open={showModal}
        onClose={() => setShowModal(false)}
        customer={selectedCustomer}
        onSuccess={(updatedCustomer) => {
          // Handle successful update
          console.log('Customer updated:', updatedCustomer);
          setSelectedCustomer(null);
        }}
      />

      {/* Contact Modal */}
      <ContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        organizationId={selectedCustomer?.id}
        onContactCreated={handleContactCreated}
      />
    </div>
  );
}