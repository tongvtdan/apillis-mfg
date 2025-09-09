import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ProjectDetailsSectionProps } from './types';

export function ProjectDetailsSection({
    form,
    collapsed,
    onToggle,
    submissionType,
    tempProjectId,
    isGeneratingId,
    volumeFields,
    appendVolume,
    removeVolume
}: ProjectDetailsSectionProps) {
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
                            Project Details
                            {tempProjectId && (
                                <Badge variant="outline" className="text-xs font-mono ml-2">
                                    {tempProjectId}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Provide detailed information about your manufacturing project
                            {isGeneratingId && (
                                <span className="ml-2 text-xs text-muted-foreground">(Generating ID...)</span>
                            )}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            {!collapsed && (
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="projectTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Title * (3-100 characters)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="e.g., High-Precision Sensor Mount"
                                            {...field}
                                            maxLength={100}
                                        />
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                                            {field.value?.length || 0}/100
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description * (50-2000 characters)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Describe your project requirements, specifications, and any special considerations..."
                                            className="min-h-[100px] pr-16"
                                            {...field}
                                            maxLength={2000}
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-1 rounded">
                                            {field.value?.length || 0}/2000
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Volume Fields */}
                    <div className="space-y-2">
                        <FormLabel>Estimated Volume</FormLabel>
                        {volumeFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-end">
                                <FormField
                                    control={form.control}
                                    name={`volumes.${index}.qty`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="100"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`volumes.${index}.unit`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Unit</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="pcs">Pieces</SelectItem>
                                                    <SelectItem value="units">Units</SelectItem>
                                                    <SelectItem value="kits">Kits</SelectItem>
                                                    <SelectItem value="assembly">Assembly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`volumes.${index}.freq`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="per year">Per Year</SelectItem>
                                                    <SelectItem value="per month">Per Month</SelectItem>
                                                    <SelectItem value="per quarter">Per Quarter</SelectItem>
                                                    <SelectItem value="prototype">Prototype</SelectItem>
                                                    <SelectItem value="initial">Initial Order</SelectItem>
                                                    <SelectItem value="one_time">One Time Order</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {volumeFields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeVolume(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendVolume({ qty: 1000, unit: 'pcs', freq: 'per year' })}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Volume Tier
                        </Button>
                    </div>

                    <FormField
                        control={form.control}
                        name="targetPricePerUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Price (per unit)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="8.50"
                                            className="pl-8"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="desiredDeliveryDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Desired Delivery Date *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {submissionType === 'Purchase Order' && (
                        <FormField
                            control={form.control}
                            name="projectReference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Reference</FormLabel>
                                    <FormControl>
                                        <Input placeholder="PO-2025-TECHNOVA-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </CardContent>
            )}
        </Card>
    );
}
