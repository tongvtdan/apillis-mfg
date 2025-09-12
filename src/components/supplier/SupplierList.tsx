import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    RefreshCw,
    ChevronDown,
    Calendar,
    DollarSign,
    TrendingUp,
    ChevronRight
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
        qualityScore?: number;
        costCompetitiveness?: number;
    };
    country?: string;
    supplierType?: 'manufacturer' | 'distributor' | 'service_provider' | 'raw_material' | 'component';
    lastActivity?: string;
    annualSpend?: number;
    paymentTerms?: string;
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
            turnaroundDays: 3.2,
            qualityScore: 95,
            costCompetitiveness: 85
        },
        country: 'USA',
        supplierType: 'manufacturer',
        lastActivity: '2025-09-10',
        annualSpend: 125000,
        paymentTerms: 'Net 30'
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
            turnaroundDays: 4.1,
            qualityScore: 88,
            costCompetitiveness: 92
        },
        country: 'USA',
        supplierType: 'manufacturer',
        lastActivity: '2025-09-08',
        annualSpend: 87000,
        paymentTerms: 'Net 45'
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
        country: 'Canada',
        supplierType: 'manufacturer',
        lastActivity: '2025-08-15',
        annualSpend: 0,
        paymentTerms: ''
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
            turnaroundDays: 5.0,
            qualityScore: 92,
            costCompetitiveness: 78
        },
        country: 'Mexico',
        supplierType: 'manufacturer',
        lastActivity: '2025-09-05',
        annualSpend: 65000,
        paymentTerms: 'Net 30'
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
            turnaroundDays: 2.8,
            qualityScore: 85,
            costCompetitiveness: 95
        },
        country: 'USA',
        supplierType: 'component',
        lastActivity: '2025-09-11',
        annualSpend: 42000,
        paymentTerms: 'Net 15'
    },
    {
        id: '6',
        name: 'Global Distribution Co',
        company: 'Global Distribution Co',
        specialties: ['Logistics', 'Warehousing'],
        status: 'qualified',
        expiryDate: 'Sep 2026',
        capabilities: ['Logistics', 'Warehousing'],
        performance: {
            rating: 4.3,
            responseRate: 99,
            turnaroundDays: 1.5,
            qualityScore: 90,
            costCompetitiveness: 88
        },
        country: 'Germany',
        supplierType: 'distributor',
        lastActivity: '2025-09-09',
        annualSpend: 35000,
        paymentTerms: 'Net 60'
    },
    {
        id: '7',
        name: 'Tech Services Plus',
        company: 'Tech Services Plus',
        specialties: ['Maintenance', 'Consulting'],
        status: 'qualified',
        expiryDate: 'Apr 2027',
        capabilities: ['Maintenance', 'Consulting'],
        performance: {
            rating: 4.6,
            responseRate: 96,
            turnaroundDays: 2.0,
            qualityScore: 93,
            costCompetitiveness: 80
        },
        country: 'UK',
        supplierType: 'service_provider',
        lastActivity: '2025-09-07',
        annualSpend: 28000,
        paymentTerms: 'Net 30'
    }
];

const PROCESS_FILTERS = [
    'CNC Machining',
    'Sheet Metal',
    'Injection Molding',
    'Casting',
    '3D Printing',
    'Welding',
    'Electronics Assembly',
    'Turning',
    'Grinding',
    'Laser Cutting',
    'Stamping',
    'Forging'
];

const MATERIAL_FILTERS = [
    'Aluminum',
    'Steel',
    'Plastic',
    'Copper',
    'Titanium',
    'Brass',
    'Stainless Steel',
    'Carbon Fiber',
    'Ceramic',
    'Silicon'
];

const TOLERANCE_FILTERS = [
    '±0.01mm',
    '±0.05mm',
    '±0.1mm',
    '±0.005mm',
    '±0.001mm',
    '±0.1%',
    '±0.1in'
];

const CERTIFICATION_FILTERS = [
    'ISO 9001',
    'ISO 14001',
    'AS9100',
    'IATF 16949',
    'RoHS',
    'REACH',
    'UL',
    'CE',
    'FCC',
    'OSHA'
];

const REGION_FILTERS = [
    'North America',
    'Europe',
    'Asia',
    'South America',
    'Africa',
    'Oceania'
];

const COUNTRY_FILTERS = [
    'USA',
    'Canada',
    'Mexico',
    'Germany',
    'UK',
    'France',
    'China',
    'Japan',
    'India',
    'Brazil'
];

const STATUS_FILTERS = [
    'Qualified',
    'Expiring Soon',
    'Not Qualified',
    'In Progress'
];

const SUPPLIER_TYPE_FILTERS = [
    { value: 'manufacturer', label: 'Manufacturer', icon: '🏭' },
    { value: 'distributor', label: 'Distributor', icon: '📦' },
    { value: 'service_provider', label: 'Service Provider', icon: '🔧' },
    { value: 'raw_material', label: 'Raw Material', icon: '⚗️' },
    { value: 'component', label: 'Component', icon: '⚙️' }
];

const PERFORMANCE_RATING_FILTERS = [
    { label: '5 Stars', value: '5', min: 4.5, max: 5.0 },
    { label: '4+ Stars', value: '4', min: 4.0, max: 4.9 },
    { label: '3+ Stars', value: '3', min: 3.0, max: 3.9 },
    { label: 'Under 3 Stars', value: 'under3', min: 0.0, max: 2.9 }
];

const QUALITY_SCORE_FILTERS = [
    { label: '90+ Score', value: '90', min: 90, max: 100 },
    { label: '80-89 Score', value: '80', min: 80, max: 89 },
    { label: '70-79 Score', value: '70', min: 70, max: 79 },
    { label: 'Under 70', value: 'under70', min: 0, max: 69 }
];

const PAYMENT_TERMS_FILTERS = [
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60',
    'Net 90',
    'COD',
    'CIA'
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
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedSupplierTypes, setSelectedSupplierTypes] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
    const [selectedQualityScores, setSelectedQualityScores] = useState<string[]>([]);
    const [minResponseRate, setMinResponseRate] = useState<number | ''>('');
    const [maxTurnaroundDays, setMaxTurnaroundDays] = useState<number | ''>('');
    const [minAnnualSpend, setMinAnnualSpend] = useState<number | ''>('');
    const [maxAnnualSpend, setMaxAnnualSpend] = useState<number | ''>('');
    const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string[]>([]);
    const [lastActivityDays, setLastActivityDays] = useState<string>('any');

    // Collapsible states
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [collapsedFilters, setCollapsedFilters] = useState<Record<string, boolean>>({
        process: false,
        material: false,
        tolerance: false,
        certification: false,
        region: false,
        country: false,
        status: false,
        supplierType: false,
        performance: false,
        financial: false,
        activity: false
    });

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

    const toggleCountry = (country: string) => {
        setSelectedCountries(prev =>
            prev.includes(country)
                ? prev.filter(c => c !== country)
                : [...prev, country]
        );
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const toggleSupplierType = (type: string) => {
        setSelectedSupplierTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const toggleRating = (rating: string) => {
        setSelectedRatings(prev =>
            prev.includes(rating)
                ? prev.filter(r => r !== rating)
                : [...prev, rating]
        );
    };

    const toggleQualityScore = (score: string) => {
        setSelectedQualityScores(prev =>
            prev.includes(score)
                ? prev.filter(s => s !== score)
                : [...prev, score]
        );
    };

    const togglePaymentTerm = (term: string) => {
        setSelectedPaymentTerms(prev =>
            prev.includes(term)
                ? prev.filter(t => t !== term)
                : [...prev, term]
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

        // Country filter
        const matchesCountries = selectedCountries.length === 0 ||
            (supplier.country && selectedCountries.includes(supplier.country));

        // Status filter
        const matchesStatus = selectedStatuses.length === 0 ||
            selectedStatuses.some(status => {
                if (status === 'Qualified' && supplier.status === 'qualified') return true;
                if (status === 'Expiring Soon' && supplier.status === 'expiring_soon') return true;
                if (status === 'Not Qualified' && supplier.status === 'not_qualified') return true;
                if (status === 'In Progress' && supplier.status === 'in_progress') return true;
                return false;
            });

        // Supplier type filter
        const matchesSupplierTypes = selectedSupplierTypes.length === 0 ||
            (supplier.supplierType && selectedSupplierTypes.includes(supplier.supplierType));

        // Performance rating filter
        const matchesRatings = selectedRatings.length === 0 ||
            selectedRatings.some(ratingValue => {
                const ratingFilter = PERFORMANCE_RATING_FILTERS.find(r => r.value === ratingValue);
                if (!ratingFilter) return false;
                return supplier.performance.rating >= ratingFilter.min && supplier.performance.rating <= ratingFilter.max;
            });

        // Quality score filter
        const matchesQualityScores = selectedQualityScores.length === 0 ||
            selectedQualityScores.some(scoreValue => {
                const scoreFilter = QUALITY_SCORE_FILTERS.find(s => s.value === scoreValue);
                if (!scoreFilter || supplier.performance.qualityScore === undefined) return false;
                return supplier.performance.qualityScore >= scoreFilter.min && supplier.performance.qualityScore <= scoreFilter.max;
            });

        // Response rate filter
        const matchesMinResponseRate = minResponseRate === '' ||
            supplier.performance.responseRate >= Number(minResponseRate);

        // Turnaround days filter
        const matchesMaxTurnaroundDays = maxTurnaroundDays === '' ||
            supplier.performance.turnaroundDays <= Number(maxTurnaroundDays);

        // Annual spend filters
        const matchesMinAnnualSpend = minAnnualSpend === '' ||
            (supplier.annualSpend !== undefined && supplier.annualSpend >= Number(minAnnualSpend));
        const matchesMaxAnnualSpend = maxAnnualSpend === '' ||
            (supplier.annualSpend !== undefined && supplier.annualSpend <= Number(maxAnnualSpend));

        // Payment terms filter
        const matchesPaymentTerms = selectedPaymentTerms.length === 0 ||
            (supplier.paymentTerms && selectedPaymentTerms.includes(supplier.paymentTerms));

        // Last activity filter
        const matchesLastActivity = lastActivityDays === 'any' || lastActivityDays === '' || !lastActivityDays ||
            (supplier.lastActivity && isWithinLastDays(supplier.lastActivity, parseInt(lastActivityDays)));

        return matchesSearch && matchesProcesses && matchesMaterials && matchesTolerances &&
            matchesCertifications && matchesRegions && matchesCountries && matchesStatus && matchesSupplierTypes &&
            matchesRatings && matchesQualityScores && matchesMinResponseRate && matchesMaxTurnaroundDays &&
            matchesMinAnnualSpend && matchesMaxAnnualSpend && matchesPaymentTerms && matchesLastActivity;
    });

    // Helper function to check if a date is within the last N days
    const isWithinLastDays = (dateString: string, days: number): boolean => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    };

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

    const getSupplierTypeBadge = (type: Supplier['supplierType']) => {
        const typeConfig = SUPPLIER_TYPE_FILTERS.find(t => t.value === type);
        if (!typeConfig) return null;

        return (
            <Badge className="text-xs" variant="secondary">
                <span className="mr-1">{typeConfig.icon}</span>
                {typeConfig.label}
            </Badge>
        );
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

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedProcesses([]);
        setSelectedMaterials([]);
        setSelectedTolerances([]);
        setSelectedCertifications([]);
        setSelectedRegions([]);
        setSelectedCountries([]);
        setSelectedStatuses([]);
        setSelectedSupplierTypes([]);
        setSelectedRatings([]);
        setSelectedQualityScores([]);
        setMinResponseRate('');
        setMaxTurnaroundDays('');
        setMinAnnualSpend('');
        setMaxAnnualSpend('');
        setSelectedPaymentTerms([]);
        setLastActivityDays('any');
    };

    // Toggle filter section collapse state
    const toggleFilterSection = (section: string) => {
        setCollapsedFilters(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Toggle main filters section
    const toggleFilters = () => {
        setFiltersExpanded(!filtersExpanded);
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

            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={toggleFilters}
                    className="flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" />
                    {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Save Filter As: "Qualified Precision CNC – West Coast"
                </Button>
                {filtersExpanded && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Filters - Only show when expanded */}
            {filtersExpanded && (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Process Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('process')}
                                >
                                    <span>Process</span>
                                    {collapsedFilters.process ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.process && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {PROCESS_FILTERS.map((process) => (
                                            <div key={process} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`process-${process}`}
                                                    checked={selectedProcesses.includes(process)}
                                                    onCheckedChange={() => toggleProcess(process)}
                                                />
                                                <Label
                                                    htmlFor={`process-${process}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {process}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Material Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('material')}
                                >
                                    <span>Material</span>
                                    {collapsedFilters.material ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.material && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {MATERIAL_FILTERS.map((material) => (
                                            <div key={material} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`material-${material}`}
                                                    checked={selectedMaterials.includes(material)}
                                                    onCheckedChange={() => toggleMaterial(material)}
                                                />
                                                <Label
                                                    htmlFor={`material-${material}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {material}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tolerance Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('tolerance')}
                                >
                                    <span>Tolerance</span>
                                    {collapsedFilters.tolerance ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.tolerance && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {TOLERANCE_FILTERS.map((tolerance) => (
                                            <div key={tolerance} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`tolerance-${tolerance}`}
                                                    checked={selectedTolerances.includes(tolerance)}
                                                    onCheckedChange={() => toggleTolerance(tolerance)}
                                                />
                                                <Label
                                                    htmlFor={`tolerance-${tolerance}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {tolerance}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Certifications Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('certification')}
                                >
                                    <span>Certifications</span>
                                    {collapsedFilters.certification ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.certification && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {CERTIFICATION_FILTERS.map((certification) => (
                                            <div key={certification} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`certification-${certification}`}
                                                    checked={selectedCertifications.includes(certification)}
                                                    onCheckedChange={() => toggleCertification(certification)}
                                                />
                                                <Label
                                                    htmlFor={`certification-${certification}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {certification}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Region Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('region')}
                                >
                                    <span>Region</span>
                                    {collapsedFilters.region ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.region && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {REGION_FILTERS.map((region) => (
                                            <div key={region} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`region-${region}`}
                                                    checked={selectedRegions.includes(region)}
                                                    onCheckedChange={() => toggleRegion(region)}
                                                />
                                                <Label
                                                    htmlFor={`region-${region}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {region}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Country Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('country')}
                                >
                                    <span>Country</span>
                                    {collapsedFilters.country ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.country && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {COUNTRY_FILTERS.map((country) => (
                                            <div key={country} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`country-${country}`}
                                                    checked={selectedCountries.includes(country)}
                                                    onCheckedChange={() => toggleCountry(country)}
                                                />
                                                <Label
                                                    htmlFor={`country-${country}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {country}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('status')}
                                >
                                    <span>Status</span>
                                    {collapsedFilters.status ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.status && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {STATUS_FILTERS.map((status) => (
                                            <div key={status} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`status-${status}`}
                                                    checked={selectedStatuses.includes(status)}
                                                    onCheckedChange={() => toggleStatus(status)}
                                                />
                                                <Label
                                                    htmlFor={`status-${status}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {status}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Supplier Type Filter */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('supplierType')}
                                >
                                    <span>Supplier Type</span>
                                    {collapsedFilters.supplierType ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.supplierType && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {SUPPLIER_TYPE_FILTERS.map((type) => (
                                            <div key={type.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`type-${type.value}`}
                                                    checked={selectedSupplierTypes.includes(type.value)}
                                                    onCheckedChange={() => toggleSupplierType(type.value)}
                                                />
                                                <Label
                                                    htmlFor={`type-${type.value}`}
                                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    <span className="mr-1">{type.icon}</span>
                                                    {type.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Performance Filters */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('performance')}
                                >
                                    <span>Performance</span>
                                    {collapsedFilters.performance ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.performance && (
                                    <div className="space-y-3">
                                        {/* Rating Filter */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Rating</Label>
                                            <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                                                {PERFORMANCE_RATING_FILTERS.map((rating) => (
                                                    <div key={rating.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`rating-${rating.value}`}
                                                            checked={selectedRatings.includes(rating.value)}
                                                            onCheckedChange={() => toggleRating(rating.value)}
                                                        />
                                                        <Label
                                                            htmlFor={`rating-${rating.value}`}
                                                            className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {rating.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quality Score Filter */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Quality Score</Label>
                                            <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                                                {QUALITY_SCORE_FILTERS.map((score) => (
                                                    <div key={score.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`quality-${score.value}`}
                                                            checked={selectedQualityScores.includes(score.value)}
                                                            onCheckedChange={() => toggleQualityScore(score.value)}
                                                        />
                                                        <Label
                                                            htmlFor={`quality-${score.value}`}
                                                            className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {score.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Response Rate Filter */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Min Response Rate (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={minResponseRate}
                                                onChange={(e) => setMinResponseRate(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="h-8 text-xs"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Turnaround Days Filter */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Max Turnaround (days)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={maxTurnaroundDays}
                                                onChange={(e) => setMaxTurnaroundDays(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="h-8 text-xs"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Financial Filters */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('financial')}
                                >
                                    <span>Financial</span>
                                    {collapsedFilters.financial ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.financial && (
                                    <div className="space-y-3">
                                        {/* Annual Spend Filters */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Min Annual Spend ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={minAnnualSpend}
                                                onChange={(e) => setMinAnnualSpend(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="h-8 text-xs"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Max Annual Spend ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={maxAnnualSpend}
                                                onChange={(e) => setMaxAnnualSpend(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="h-8 text-xs"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Payment Terms Filter */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Payment Terms</Label>
                                            <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                                                {PAYMENT_TERMS_FILTERS.map((term) => (
                                                    <div key={term} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`payment-${term}`}
                                                            checked={selectedPaymentTerms.includes(term)}
                                                            onCheckedChange={() => togglePaymentTerm(term)}
                                                        />
                                                        <Label
                                                            htmlFor={`payment-${term}`}
                                                            className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {term}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Activity Filters */}
                            <div>
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium mb-2 p-1 hover:bg-muted rounded"
                                    onClick={() => toggleFilterSection('activity')}
                                >
                                    <span>Activity</span>
                                    {collapsedFilters.activity ?
                                        <ChevronRight className="w-4 h-4" /> :
                                        <ChevronDown className="w-4 h-4" />
                                    }
                                </button>
                                {!collapsedFilters.activity && (
                                    <div className="space-y-3">
                                        {/* Last Activity Filter */}
                                        <div>
                                            <Label className="text-xs font-normal mb-1 block">Last Activity (days)</Label>
                                            <Select value={lastActivityDays} onValueChange={setLastActivityDays}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Any time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any time</SelectItem>
                                                    <SelectItem value="7">Last 7 days</SelectItem>
                                                    <SelectItem value="30">Last 30 days</SelectItem>
                                                    <SelectItem value="90">Last 90 days</SelectItem>
                                                    <SelectItem value="365">Last year</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

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
                                    {supplier.supplierType && getSupplierTypeBadge(supplier.supplierType)}
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
                                    {supplier.annualSpend !== undefined && supplier.annualSpend > 0 && (
                                        <div className="flex items-center">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            ${supplier.annualSpend.toLocaleString()}
                                        </div>
                                    )}
                                    {supplier.paymentTerms && (
                                        <div className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {supplier.paymentTerms}
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
                                        <span>{supplier.performance.turnaroundDays} days</span>
                                    </div>
                                    {supplier.performance.qualityScore !== undefined && (
                                        <div className="flex items-center text-sm">
                                            <Award className="w-4 h-4 text-purple-500 mr-1" />
                                            <span>Q: {supplier.performance.qualityScore}</span>
                                        </div>
                                    )}
                                    {supplier.performance.costCompetitiveness !== undefined && (
                                        <div className="flex items-center text-sm">
                                            <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                                            <span>C: {supplier.performance.costCompetitiveness}</span>
                                        </div>
                                    )}
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