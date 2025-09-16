import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Users,
    Filter
} from 'lucide-react';

interface Supplier {
    id: string;
    name: string;
    qualificationStatus: 'not_started' | 'in_progress' | 'pending_approval' | 'qualified' | 'qualified_with_conditions' | 'qualified_as_exception' | 'rejected' | 'expired';
    specialties: string[];
    responseRate: number;
    averageTurnaroundDays: number;
}

interface RFQDistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id: string;
        title: string;
        dueDate?: string;
    };
    suppliers: Supplier[];
    onSubmit: (data: {
        selectedSuppliers: string[];
        dueDate: string;
        priority: 'low' | 'normal' | 'high' | 'urgent';
        requirements: string;
        specialInstructions: string;
    }) => void;
}

const QUALIFICATION_STATUS_CONFIG = {
    not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
    qualified: { label: 'Qualified ✅', color: 'bg-green-100 text-green-800' },
    'qualified_with_conditions': { label: 'Qualified with Conditions ⚠️', color: 'bg-yellow-100 text-yellow-800' },
    'qualified_as_exception': { label: 'Qualified as Exception ⚠️', color: 'bg-orange-100 text-orange-800' },
    rejected: { label: 'Rejected ❌', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Expired ⚠️', color: 'bg-red-100 text-red-800' }
};

const SPECIALTY_LABELS: Record<string, string> = {
    'cnc_machining': 'CNC Machining',
    'sheet_metal': 'Sheet Metal',
    'injection_molding': 'Injection Molding',
    'welding': 'Welding',
    'surface_finishing': 'Surface Finishing',
    'assembly': 'Assembly',
    'electronics': 'Electronics',
    'quality_testing': 'Quality Testing'
};

export function RFQDistributionModal({ isOpen, onClose, project, suppliers, onSubmit }: RFQDistributionModalProps) {
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState(project.dueDate || '');
    const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
    const [requirements, setRequirements] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

    // Get all unique specialties from suppliers
    const allSpecialties = Array.from(
        new Set(suppliers.flatMap(supplier => supplier.specialties))
    );

    // Filter suppliers based on search and specialties
    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialties = selectedSpecialties.length === 0 ||
            selectedSpecialties.some(specialty => supplier.specialties.includes(specialty));
        return matchesSearch && matchesSpecialties;
    });

    // Filter to only show qualified suppliers
    const qualifiedSuppliers = filteredSuppliers.filter(supplier =>
        ['qualified', 'qualified_with_conditions', 'qualified_as_exception'].includes(supplier.qualificationStatus)
    );

    // Filter to show unqualified suppliers (for warning)
    const unqualifiedSuppliers = filteredSuppliers.filter(supplier =>
        !['qualified', 'qualified_with_conditions', 'qualified_as_exception'].includes(supplier.qualificationStatus)
    );

    const toggleSupplier = (supplierId: string) => {
        setSelectedSuppliers(prev =>
            prev.includes(supplierId)
                ? prev.filter(id => id !== supplierId)
                : [...prev, supplierId]
        );
    };

    const toggleSpecialty = (specialty: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(specialty)
                ? prev.filter(s => s !== specialty)
                : [...prev, specialty]
        );
    };

    const handleSubmit = () => {
        onSubmit({
            selectedSuppliers,
            dueDate,
            priority,
            requirements,
            specialInstructions
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Distribute RFQ – ${project.title}`}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Supplier Selection */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-3 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Select Suppliers
                            </h3>

                            {/* Search and Filters */}
                            <div className="mb-4 space-y-3">
                                <div className="relative">
                                    <Input
                                        placeholder="Search suppliers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm font-medium">Filter by Specialties</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedSpecialties([])}
                                            className="text-xs"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {allSpecialties.map(specialty => (
                                            <Badge
                                                key={specialty}
                                                variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                                                className="cursor-pointer text-xs"
                                                onClick={() => toggleSpecialty(specialty)}
                                            >
                                                {SPECIALTY_LABELS[specialty] || specialty}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Supplier List */}
                            <div className="border rounded-lg max-h-96 overflow-y-auto">
                                {qualifiedSuppliers.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No qualified suppliers match your filters
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {qualifiedSuppliers.map(supplier => (
                                            <div key={supplier.id} className="p-3 hover:bg-muted/50 flex items-center">
                                                <Checkbox
                                                    checked={selectedSuppliers.includes(supplier.id)}
                                                    onCheckedChange={() => toggleSupplier(supplier.id)}
                                                    className="mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">{supplier.name}</p>
                                                        <Badge className={QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus].color}>
                                                            {QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus].label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {supplier.specialties.slice(0, 2).map(specialty => (
                                                            <Badge key={specialty} variant="secondary" className="text-xs">
                                                                {SPECIALTY_LABELS[specialty] || specialty}
                                                            </Badge>
                                                        ))}
                                                        {supplier.specialties.length > 2 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{supplier.specialties.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex text-xs text-muted-foreground mt-1">
                                                        <span className="mr-3">⏱️ {supplier.averageTurnaroundDays}d avg</span>
                                                        <span>✅ {supplier.responseRate}% response</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Warning for unqualified suppliers */}
                            {unqualifiedSuppliers.length > 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">
                                                {unqualifiedSuppliers.length} unqualified suppliers filtered out
                                            </p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Only qualified suppliers can receive RFQs. Unqualified suppliers are blocked from selection.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - RFQ Details */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-3">RFQ Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="due-date" className="text-sm font-medium">
                                        Due Date
                                    </Label>
                                    <div className="relative mt-1">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            id="due-date"
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="priority" className="text-sm font-medium">
                                        Priority
                                    </Label>
                                    <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="requirements" className="text-sm font-medium">
                                        Requirements
                                    </Label>
                                    <Textarea
                                        id="requirements"
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                        placeholder="Technical specifications, quality requirements, delivery terms..."
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="special-instructions" className="text-sm font-medium">
                                        Special Instructions
                                    </Label>
                                    <Textarea
                                        id="special-instructions"
                                        value={specialInstructions}
                                        onChange={(e) => setSpecialInstructions(e.target.value)}
                                        placeholder="Special handling, packaging requirements, NDA requirements..."
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Selected Suppliers Summary */}
                        {selectedSuppliers.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-3">Selected Suppliers ({selectedSuppliers.length})</h3>
                                <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSuppliers.map(supplierId => {
                                            const supplier = suppliers.find(s => s.id === supplierId);
                                            return supplier ? (
                                                <Badge key={supplierId} variant="secondary" className="flex items-center">
                                                    {supplier.name}
                                                    <button
                                                        onClick={() => toggleSupplier(supplierId)}
                                                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview */}
                        <div className="bg-muted p-4 rounded-lg">
                            <h3 className="font-medium mb-2 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                RFQ Bundle Preview
                            </h3>
                            <ul className="text-sm space-y-1">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Technical drawings (redacted if needed)
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    BOM
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Quality specs
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Target price & volume
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedSuppliers.length === 0 || !dueDate}
                    >
                        Send RFQs ({selectedSuppliers.length})
                    </Button>
                </div>
            </div>
        </Modal>
    );
}