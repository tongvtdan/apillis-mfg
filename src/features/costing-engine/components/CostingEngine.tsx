import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/core/auth';
import {
    Plus,
    Minus,
    Calculator,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    BarChart3,
    Save,
    Download,
    Target,
    Zap
} from 'lucide-react';
import {
    CostItem,
    CostingResult,
    COSTING_CONFIG,
    CostCalculations
} from '../types/costing-engine.types';
import { CostingEngineService } from '../services/costingEngineService';

interface CostingEngineProps {
    projectId: string;
    projectTitle: string;
    initialQuantity?: number;
    onSave?: (result: CostingResult) => void;
    onExport?: (data: any) => void;
}

export function CostingEngine({
    projectId,
    projectTitle,
    initialQuantity = 100,
    onSave,
    onExport
}: CostingEngineProps) {
    const { user } = useAuth();
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationResult, setCalculationResult] = useState<CostingResult | null>(null);
    const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(initialQuantity);
    const [targetMargin, setTargetMargin] = useState(25);

    const form = useForm({
        defaultValues: {
            costItems: [
                {
                    category: 'material' as const,
                    type: 'variable' as const,
                    name: 'Raw Materials',
                    unitCost: 10,
                    quantity: quantity,
                    supplier: '',
                    notes: ''
                },
                {
                    category: 'labor' as const,
                    type: 'variable' as const,
                    name: 'Assembly Labor',
                    unitCost: 25,
                    quantity: quantity * 0.5, // 30 minutes per unit
                    supplier: '',
                    notes: ''
                },
                {
                    category: 'overhead' as const,
                    type: 'fixed' as const,
                    name: 'Factory Overhead',
                    unitCost: 5000,
                    quantity: 1,
                    supplier: '',
                    notes: 'Monthly overhead allocation'
                }
            ]
        }
    });

    const costItemsField = useFieldArray({
        control: form.control,
        name: 'costItems'
    });

    // Update quantities when quantity changes
    useEffect(() => {
        const currentItems = form.getValues('costItems');
        currentItems.forEach((item, index) => {
            if (item.type === 'variable') {
                form.setValue(`costItems.${index}.quantity`, quantity);
            } else if (item.category === 'labor') {
                // Labor quantity is typically hours per unit
                form.setValue(`costItems.${index}.quantity`, quantity * 0.5);
            }
        });
    }, [quantity, form]);

    const addCostItem = () => {
        costItemsField.append({
            category: 'material',
            type: 'variable',
            name: '',
            unitCost: 0,
            quantity: quantity,
            supplier: '',
            notes: ''
        });
    };

    const removeCostItem = (index: number) => {
        costItemsField.remove(index);
    };

    const calculateCosts = async () => {
        setIsCalculating(true);
        try {
            const costItems = form.getValues('costItems');
            const result = await CostingEngineService.calculateScenario(
                projectId,
                costItems,
                quantity,
                targetMargin
            );
            setCalculationResult(result);
        } catch (error) {
            console.error('Calculation failed:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const saveScenario = async () => {
        if (!calculationResult || !user?.id) return;

        try {
            const scenarioId = await CostingEngineService.saveScenario(
                projectId,
                calculationResult.scenario,
                user.id
            );
            console.log('Scenario saved:', scenarioId);
            onSave?.(calculationResult);
        } catch (error) {
            console.error('Failed to save scenario:', error);
        }
    };

    const exportData = () => {
        if (!calculationResult) return;

        const exportData = CostingEngineService.exportCostingData(calculationResult.scenario);
        onExport?.(exportData);
    };

    const totalCost = costItemsField.fields.reduce((sum, item, index) => {
        const itemData = form.getValues(`costItems.${index}`);
        return sum + CostCalculations.calculateItemCost(itemData, quantity);
    }, 0);

    const costPerUnit = totalCost / quantity;
    const recommendedPrice = costPerUnit * (1 + targetMargin / 100);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <Calculator className="h-6 w-6" />
                                <span>Costing Engine</span>
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                                Project: {projectTitle}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                                ID: {projectId}
                            </Badge>
                            <Badge variant="secondary">
                                {quantity} units
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cost Input Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Cost Inputs</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Volume and Margin Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Production Volume</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="margin">Target Margin (%)</Label>
                                    <Input
                                        id="margin"
                                        type="number"
                                        value={targetMargin}
                                        onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            {/* Cost Items */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Cost Items</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addCostItem}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </Button>
                                </div>

                                <Form {...form}>
                                    <div className="space-y-4">
                                        {costItemsField.fields.map((field, index) => (
                                            <Card key={field.id} className="p-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                                    <FormField
                                                        control={form.control}
                                                        name={`costItems.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Item name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`costItems.${index}.category`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Category</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {Object.entries(COSTING_CONFIG.categories).map(([key, config]) => (
                                                                            <SelectItem key={key} value={key}>
                                                                                <Badge className={config.color}>
                                                                                    {config.label}
                                                                                </Badge>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`costItems.${index}.type`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Type</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {Object.entries(COSTING_CONFIG.types).map(([key, config]) => (
                                                                            <SelectItem key={key} value={key}>
                                                                                {config.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeCostItem(index)}
                                                            disabled={costItemsField.fields.length === 1}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`costItems.${index}.unitCost`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit Cost ($)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`costItems.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="1"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`costItems.${index}.supplier`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Supplier (Optional)</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Supplier name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex items-end">
                                                        <div className="text-sm text-muted-foreground">
                                                            Total: ${(form.watch(`costItems.${index}.unitCost`) * form.watch(`costItems.${index}.quantity`)).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </Form>
                            </div>

                            {/* Calculate Button */}
                            <div className="flex justify-center">
                                <Button
                                    onClick={calculateCosts}
                                    disabled={isCalculating}
                                    size="lg"
                                    className="min-w-[200px]"
                                >
                                    {isCalculating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Calculator className="h-4 w-4 mr-2" />
                                            Calculate Costs
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5" />
                                <span>Cost Summary</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-primary">
                                        ${totalCost.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Total Cost
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${costPerUnit.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Cost per Unit
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Target Margin:</span>
                                    <span>{targetMargin}%</span>
                                </div>
                                <Progress value={targetMargin} className="h-2" />
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-xl font-bold text-green-700">
                                    ${recommendedPrice.toFixed(2)}
                                </div>
                                <div className="text-sm text-green-600">
                                    Recommended Price
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={saveScenario}
                                disabled={!calculationResult}
                                className="w-full"
                                variant="default"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Scenario
                            </Button>

                            <Button
                                onClick={exportData}
                                disabled={!calculationResult}
                                className="w-full"
                                variant="outline"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Data
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Detailed Results */}
                    {calculationResult && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="h-5 w-5" />
                                    <span>Analysis Results</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Break-even Point:</span>
                                        <span>{calculationResult.scenario.marginAnalysis.breakEvenPoint.toFixed(0)} units</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Profit per Unit:</span>
                                        <span className="text-green-600">
                                            ${calculationResult.scenario.marginAnalysis.profitPerUnit.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>ROI:</span>
                                        <span>{calculationResult.scenario.marginAnalysis.roi.toFixed(1)}%</span>
                                    </div>
                                </div>

                                {calculationResult.risks.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-orange-700">Risk Factors</h4>
                                        {calculationResult.risks.slice(0, 2).map((risk, index) => (
                                            <div key={index} className="text-xs text-orange-600">
                                                • {risk.description}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
