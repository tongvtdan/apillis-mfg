import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Plus, Minus, Loader2 } from 'lucide-react';
import { IntakeFormData, ProjectDetailsSectionProps, VolumeItem } from '../../types/intake.types';

export function ProjectDetailsSection({
    form,
    submissionType,
    tempProjectId,
    isGeneratingId,
    volumeFields,
    appendVolume,
    removeVolume,
    collapsed,
    onToggle
}: ProjectDetailsSectionProps) {

    const addVolumeItem = () => {
        appendVolume({
            qty: 1,
            unit: 'pcs',
            freq: 'one_time'
        });
    };

    const removeVolumeItem = (index: number) => {
        removeVolume(index);
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
                        <CardTitle className="text-lg">Project Details</CardTitle>
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
                    <CardTitle className="text-lg">Project Details</CardTitle>
                    <ChevronUp className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Project ID Display */}
                <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-medium">Project ID</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                {isGeneratingId ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">Generating...</span>
                                    </>
                                ) : (
                                    <span className="font-mono text-sm">{tempProjectId}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Project Information */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-title">Project Title *</Label>
                        <Input
                            id="project-title"
                            placeholder="Enter a descriptive project title"
                            {...form.register('projectTitle')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Project Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Provide detailed description of your project requirements, specifications, and any special considerations..."
                            rows={6}
                            {...form.register('description')}
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum 50 characters. Be as detailed as possible to help us understand your needs.
                        </p>
                    </div>
                </div>

                {/* Project Metadata */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select
                            value={form.watch('priority')}
                            onValueChange={(value) => form.setValue('priority', value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low - Standard timeline</SelectItem>
                                <SelectItem value="normal">Normal - Balanced timeline</SelectItem>
                                <SelectItem value="high">High - Expedited timeline</SelectItem>
                                <SelectItem value="urgent">Urgent - Immediate attention</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desired-delivery-date">Desired Delivery Date</Label>
                        <Input
                            id="desired-delivery-date"
                            type="date"
                            {...form.register('desiredDeliveryDate')}
                        />
                        <p className="text-xs text-muted-foreground">
                            Must be at least 7 days from today
                        </p>
                    </div>
                </div>

                {/* Purchase Order Reference (only for PO) */}
                {submissionType === 'po' && (
                    <div className="space-y-2">
                        <Label htmlFor="project-reference">Purchase Order Reference *</Label>
                        <Input
                            id="project-reference"
                            placeholder="PO-2024-001"
                            {...form.register('projectReference')}
                        />
                        <p className="text-xs text-muted-foreground">
                            Reference number from your purchase order
                        </p>
                    </div>
                )}

                {/* Volume Information */}
                {(submissionType === 'rfq' || submissionType === 'po') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Volume Requirements</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVolumeItem}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Volume
                            </Button>
                        </div>

                        {volumeFields.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No volume requirements specified</p>
                                <p className="text-sm">Click "Add Volume" to specify quantity requirements</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {volumeFields.map((field, index) => (
                                    <Card key={field.id} className="p-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                            <div className="space-y-2">
                                                <Label>Quantity *</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="100"
                                                    {...form.register(`volumes.${index}.qty`, { valueAsNumber: true })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Unit *</Label>
                                                <Select
                                                    value={form.watch(`volumes.${index}.unit`)}
                                                    onValueChange={(value) => form.setValue(`volumes.${index}.unit`, value as any)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pcs">Pieces</SelectItem>
                                                        <SelectItem value="units">Units</SelectItem>
                                                        <SelectItem value="kits">Kits</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Frequency *</Label>
                                                <Select
                                                    value={form.watch(`volumes.${index}.freq`)}
                                                    onValueChange={(value) => form.setValue(`volumes.${index}.freq`, value as any)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="one_time">One-time</SelectItem>
                                                        <SelectItem value="per year">Per Year</SelectItem>
                                                        <SelectItem value="per month">Per Month</SelectItem>
                                                        <SelectItem value="per quarter">Per Quarter</SelectItem>
                                                        <SelectItem value="prototype">Prototype</SelectItem>
                                                        <SelectItem value="initial">Initial Order</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeVolumeItem(index)}
                                                    disabled={volumeFields.length === 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Target Price (only for RFQ) */}
                {submissionType === 'rfq' && (
                    <div className="space-y-2">
                        <Label htmlFor="target-price">Target Price Per Unit</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                                id="target-price"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-8"
                                {...form.register('targetPricePerUnit', { valueAsNumber: true })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Optional: Your target price per unit for cost estimation
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
