import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  MapPin, 
  Star, 
  CheckCircle, 
  Clock,
  Eye,
  Send,
  Award,
  RefreshCw
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  company?: string;
  specialties: string[];
  status: 'qualified' | 'expiring_soon' | 'not_qualified' | 'in_progress';
  expiryDate?: string;
  capabilities: string[];
  performance: {
    rating: number;
    responseRate: number;
    turnaroundDays: number;
  };
  country?: string;
}

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Acme Precision Machining',
    company: 'Acme Precision Machining',
    specialties: ['5-Axis', '±0.01mm', 'ISO 9001'],
    status: 'qualified',
    expiryDate: 'Dec 2026',
    capabilities: ['5-Axis', '±0.01mm', 'ISO 9001'],
    performance: {
      rating: 4.8,
      responseRate: 98,
      turnaroundDays: 3.2
    },
    country: 'USA'
  },
  {
    id: '2',
    name: 'Titan Metalworks',
    company: 'Titan Metalworks',
    specialties: ['Sheet Metal', 'Welding', 'ISO 14001'],
    status: 'expiring_soon',
    expiryDate: 'Oct 2025',
    capabilities: ['Sheet Metal', 'Welding', 'ISO 14001'],
    performance: {
      rating: 4.2,
      responseRate: 92,
      turnaroundDays: 4.1
    },
    country: 'USA'
  },
  {
    id: '3',
    name: 'Global Plastics Inc.',
    company: 'Global Plastics Inc.',
    specialties: ['Injection Molding', 'Prototyping'],
    status: 'not_qualified',
    capabilities: [],
    performance: {
      rating: 0,
      responseRate: 0,
      turnaroundDays: 0
    },
    country: 'Canada'
  },
  {
    id: '4',
    name: 'Precision Castings Ltd',
    company: 'Precision Castings Ltd',
    specialties: ['Casting', 'Aluminum', 'ISO 9001'],
    status: 'qualified',
    expiryDate: 'Mar 2027',
    capabilities: ['Casting', 'Aluminum', 'ISO 9001'],
    performance: {
      rating: 4.5,
      responseRate: 87,
      turnaroundDays: 5.0
    },
    country: 'Mexico'
  },
  {
    id: '5',
    name: 'ElectroTech Components',
    company: 'ElectroTech Components',
    specialties: ['Electronics', 'PCB Assembly', 'RoHS'],
    status: 'qualified',
    expiryDate: 'Jan 2026',
    capabilities: ['Electronics', 'PCB Assembly', 'RoHS'],
    performance: {
      rating: 4.0,
      responseRate: 95,
      turnaroundDays: 2.8
    },
    country: 'USA'
  }
];

const PROCESS_FILTERS = [
  'CNC Machining',
  'Sheet Metal',
  'Injection Molding',
  'Casting'
];

const MATERIAL_FILTERS = [
  'Aluminum',
  'Steel',
  'Plastic',
  'Copper'
];

const TOLERANCE_FILTERS = [
  '±0.01mm',
  '±0.05mm',
  '±0.1mm'
];

const CERTIFICATION_FILTERS = [
  'ISO 9001',
  'ISO 14001',
  'AS9100',
  'IATF 16949'
];

const REGION_FILTERS = [
  'North America',
  'Europe',
  'Asia'
];

const STATUS_FILTERS = [
  'Qualified',
  'Expiring Soon',
  'Not Qualified'
];

interface SupplierListProps {
  onSupplierSelect?: (supplier: Supplier) => void;
  onSendRFQ?: (supplier: Supplier) => void;
  onStartQualification?: (supplier: Supplier) => void;
}

export function SupplierList({ 
  onSupplierSelect, 
  onSendRFQ, 
  onStartQualification 
}: SupplierListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedTolerances, setSelectedTolerances] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const toggleProcess = (process: string) => {
    setSelectedProcesses(prev => 
      prev.includes(process) 
        ? prev.filter(p => p !== process) 
        : [...prev, process]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material) 
        : [...prev, material]
    );
  };

  const toggleTolerance = (tolerance: string) => {
    setSelectedTolerances(prev => 
      prev.includes(tolerance) 
        ? prev.filter(t => t !== tolerance) 
        : [...prev, tolerance]
    );
  };

  const toggleCertification = (certification: string) => {
    setSelectedCertifications(prev => 
      prev.includes(certification) 
        ? prev.filter(c => c !== certification) 
        : [...prev, certification]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const filteredSuppliers = MOCK_SUPPLIERS.filter(supplier => {
    // Search filter
    const matchesSearch = !searchQuery || 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.company && supplier.company.toLowerCase().includes(searchQuery.toLowerCase()));

    // Process filter
    const matchesProcesses = selectedProcesses.length === 0 || 
      selectedProcesses.some(process => 
        supplier.specialties.some(s => s.includes(process)) ||
        supplier.capabilities.some(c => c.includes(process))
      );

    // Material filter
    const matchesMaterials = selectedMaterials.length === 0 || 
      selectedMaterials.some(material => 
        supplier.specialties.some(s => s.includes(material)) ||
        supplier.capabilities.some(c => c.includes(material))
      );

    // Tolerance filter
    const matchesTolerances = selectedTolerances.length === 0 || 
      selectedTolerances.some(tolerance => 
        supplier.specialties.some(s => s.includes(tolerance)) ||
        supplier.capabilities.some(c => c.includes(tolerance))
      );

    // Certification filter
    const matchesCertifications = selectedCertifications.length === 0 || 
      selectedCertifications.some(certification => 
        supplier.specialties.some(s => s.includes(certification)) ||
        supplier.capabilities.some(c => c.includes(certification))
      );

    // Region filter
    const matchesRegions = selectedRegions.length === 0 || 
      selectedRegions.some(region => 
        supplier.country && supplier.country.includes(region)
      );

    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || 
      selectedStatuses.some(status => {
        if (status === 'Qualified' && supplier.status === 'qualified') return true;
        if (status === 'Expiring Soon' && supplier.status === 'expiring_soon') return true;
        if (status === 'Not Qualified' && supplier.status === 'not_qualified') return true;
        return false;
      });

    return matchesSearch && matchesProcesses && matchesMaterials && matchesTolerances && 
           matchesCertifications && matchesRegions && matchesStatus;
  });

  const getStatusBadge = (status: Supplier['status'], expiryDate?: string) => {
    switch (status) {
      case 'qualified':
        return <Badge className="bg-green-100 text-green-800">Qualified ✅</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon ⚠️</Badge>;
      case 'not_qualified':
        return <Badge className="bg-red-100 text-red-800">Not Qualified ❌</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getActionButtons = (supplier: Supplier) => {
    if (supplier.status === 'qualified' || supplier.status === 'expiring_soon') {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSupplierSelect?.(supplier)}
            className="h-8"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onSendRFQ?.(supplier)}
            className="h-8"
          >
            <Send className="w-4 h-4 mr-1" />
            Send RFQ
          </Button>
          {supplier.status === 'expiring_soon' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSupplierSelect?.(supplier)}
              className="h-8"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Re-Qualify Now
            </Button>
          )}
        </div>
      );
    } else if (supplier.status === 'not_qualified') {
      return (
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => onStartQualification?.(supplier)}
          className="h-8"
        >
          <Award className="w-4 h-4 mr-1" />
          Start Qualification
        </Button>
      );
    } else {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSupplierSelect?.(supplier)}
          className="h-8"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Progress
        </Button>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-muted-foreground">
            Filter, onboard, qualify, and track performance of your supplier base
          </p>
        </div>
        <Button className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Add New Supplier
        </Button>
      </div>

      {/* Save Filter */}
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Save Filter As: "Qualified Precision CNC – West Coast"
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Process Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Process</h4>
              <div className="space-y-2">
                {PROCESS_FILTERS.map((process) => (
                  <Button 
                    key={process}
                    variant={selectedProcesses.includes(process) ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => toggleProcess(process)}
                  >
                    {process} {selectedProcesses.includes(process) ? '✓' : '▼'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Material</h4>
              <div className="space-y-2">
                {MATERIAL_FILTERS.map((material) => (
                  <Button 
                    key={material}
                    variant={selectedMaterials.includes(material) ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => toggleMaterial(material)}
                  >
                    {material} {selectedMaterials.includes(material) ? '✓' : '▼'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tolerance Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Tolerance</h4>
              <div className="space-y-2">
                {TOLERANCE_FILTERS.map((tolerance) => (
                  <Button 
                    key={tolerance}
                    variant={selectedTolerances.includes(tolerance) ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => toggleTolerance(tolerance)}
                  >
                    {tolerance} {selectedTolerances.includes(tolerance) ? '✓' : '▼'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Certifications Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Certifications</h4>
              <div className="space-y-2">
                {CERTIFICATION_FILTERS.map((certification) => (
                  <Button 
                    key={certification}
                    variant={selectedCertifications.includes(certification) ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => toggleCertification(certification)}
                  >
                    {certification} {selectedCertifications.includes(certification) ? '✓' : '▼'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Region</h4>
              <div className="space-y-2">
                {REGION_FILTERS.map((region) => (
                  <Button 
                    key={region}
                    variant={selectedRegions.includes(region) ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => toggleRegion(region)}
                  >
                    {region} {selectedRegions.includes(region) ? '✓' : '▼'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="space-y-2">
                {STATUS_FILTERS.map((status) => (
                  <Button 
                    key={status}
                    variant={selectedStatuses.includes(status) ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => toggleStatus(status)}
                  >
                    {status} {selectedStatuses.includes(status) ? '✓' : '▼'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Supplier List ({filteredSuppliers.length} matches)</h3>
      </div>

      {/* Supplier List */}
      <div className="space-y-4">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-medium">{supplier.name}</h4>
                  {getStatusBadge(supplier.status, supplier.expiryDate)}
                  {supplier.expiryDate && (
                    <span className="text-sm text-muted-foreground">
                      Exp: {supplier.expiryDate}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                  {supplier.company && (
                    <div className="flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      {supplier.company}
                    </div>
                  )}
                  {supplier.country && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {supplier.country}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {supplier.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{supplier.performance.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span>{supplier.performance.responseRate}% OTD</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-1" />
                    <span>{supplier.performance.turnaroundDays} PPM</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {getActionButtons(supplier)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing 1 to {Math.min(10, filteredSuppliers.length)} of {filteredSuppliers.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <span className="text-muted-foreground">...</span>
          <Button variant="outline" size="sm">12</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}