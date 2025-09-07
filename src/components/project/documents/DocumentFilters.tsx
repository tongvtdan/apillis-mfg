import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import type { DocumentFiltersState } from './DocumentManager';

interface DocumentFiltersProps {
    filters: DocumentFiltersState;
    onFiltersChange: (filters: Partial<DocumentFiltersState>) => void;
    onClearFilters: () => void;
    filterOptions: {
        types: string[];
        accessLevels: string[];
        uploadedBy: string[];
        tags: string[];
    };
}

/**
 * Advanced filtering component for documents with multiple criteria
 * TODO: Implement full filtering functionality with date pickers and multi-select
 */
export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
    filters,
    onFiltersChange,
    onClearFilters,
    filterOptions
}) => {
    const handleTypeToggle = (type: string) => {
        const newTypes = filters.type.includes(type)
            ? filters.type.filter(t => t !== type)
            : [...filters.type, type];
        onFiltersChange({ type: newTypes });
    };

    const handleAccessLevelToggle = (level: string) => {
        const newLevels = filters.accessLevel.includes(level)
            ? filters.accessLevel.filter(l => l !== level)
            : [...filters.accessLevel, level];
        onFiltersChange({ accessLevel: newLevels });
    };

    const handleTagToggle = (tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        onFiltersChange({ tags: newTags });
    };

    const handleUploadedByToggle = (user: string) => {
        const newUsers = filters.uploadedBy.includes(user)
            ? filters.uploadedBy.filter(u => u !== user)
            : [...filters.uploadedBy, user];
        onFiltersChange({ uploadedBy: newUsers });
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Advanced Filters</CardTitle>
                    <Button variant="outline" size="sm" onClick={onClearFilters}>
                        Clear All
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Document Types */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Document Types</Label>
                    <div className="flex flex-wrap gap-2">
                        {filterOptions.types.map((type) => (
                            <Badge
                                key={type}
                                variant={filters.type.includes(type) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/80"
                                onClick={() => handleTypeToggle(type)}
                            >
                                {type}
                                {filters.type.includes(type) && (
                                    <X className="w-3 h-3 ml-1" />
                                )}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Access Levels */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Access Levels</Label>
                    <div className="flex flex-wrap gap-2">
                        {filterOptions.accessLevels.map((level) => (
                            <Badge
                                key={level}
                                variant={filters.accessLevel.includes(level) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/80"
                                onClick={() => handleAccessLevelToggle(level)}
                            >
                                {level}
                                {filters.accessLevel.includes(level) && (
                                    <X className="w-3 h-3 ml-1" />
                                )}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload Date Range</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.dateRange.from ? (
                                        format(filters.dateRange.from, "PPP")
                                    ) : (
                                        <span>From date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filters.dateRange.from}
                                    onSelect={(date) => onFiltersChange({
                                        dateRange: { ...filters.dateRange, from: date }
                                    })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.dateRange.to ? (
                                        format(filters.dateRange.to, "PPP")
                                    ) : (
                                        <span>To date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filters.dateRange.to}
                                    onSelect={(date) => onFiltersChange({
                                        dateRange: { ...filters.dateRange, to: date }
                                    })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Tags */}
                {filterOptions.tags.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/80"
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                    {filters.tags.includes(tag) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Uploaded By */}
                {filterOptions.uploadedBy.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Uploaded By</Label>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.uploadedBy.map((user) => (
                                <Badge
                                    key={user}
                                    variant={filters.uploadedBy.includes(user) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/80"
                                    onClick={() => handleUploadedByToggle(user)}
                                >
                                    {user}
                                    {filters.uploadedBy.includes(user) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Filters Summary */}
                {(filters.type.length > 0 ||
                    filters.accessLevel.length > 0 ||
                    filters.tags.length > 0 ||
                    filters.uploadedBy.length > 0 ||
                    filters.dateRange.from ||
                    filters.dateRange.to) && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Active Filters:</span>
                                <span className="text-sm text-muted-foreground">
                                    {filters.type.length +
                                        filters.accessLevel.length +
                                        filters.tags.length +
                                        filters.uploadedBy.length +
                                        (filters.dateRange.from ? 1 : 0) +
                                        (filters.dateRange.to ? 1 : 0)} applied
                                </span>
                            </div>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
};