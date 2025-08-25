import React, { useState } from 'react';
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
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerTable } from '@/components/customer/CustomerTable';
import { CustomerModal } from '@/components/customer/CustomerModal';
import { Customer } from '@/types/project';

export default function Customers() {
  const { customers, loading } = useCustomers();
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Calculate customer statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.email).length; // Customers with email are considered active
  const countries = [...new Set(customers.map(c => c.country).filter(Boolean))].length;
  const companiesCount = customers.filter(c => c.company).length;

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Could navigate to customer detail page or show details panel
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
          <Button
            onClick={() => setShowModal(true)}
            variant="accent"
            className="action-button shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
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
              {totalCustomers > 0 ? '+' + Math.round((totalCustomers / 10) * 100) + '% from last month' : 'No customers yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-base-content/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-base-content">{activeCustomers}</div>
            <p className="text-xs text-base-content/70">
              {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) + '% with contact info' : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-base-content/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-base-content">{companiesCount}</div>
            <p className="text-xs text-base-content/70">
              {totalCustomers > 0 ? Math.round((companiesCount / totalCustomers) * 100) + '% business customers' : 'N/A'}
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
      />
    </div>
  );
}