import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    priorityFilter: string;
    onPriorityFilterChange: (priority: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    assigneeFilter: string;
    onAssigneeFilterChange: (assignee: string) => void;
    projectsCount: number;
}

export function SearchFilterBar({
    searchQuery,
    onSearchChange,
    priorityFilter,
    onPriorityFilterChange,
    statusFilter,
    onStatusFilterChange,
    assigneeFilter,
    onAssigneeFilterChange,
    projectsCount,
}: SearchFilterBarProps) {
    const [showFilters, setShowFilters] = useState(false);

    const clearAllFilters = () => {
        onSearchChange("");
        onPriorityFilterChange("all");
        onStatusFilterChange("all");
        onAssigneeFilterChange("all");
    };

    const hasActiveFilters =
        searchQuery ||
        priorityFilter !== "all" ||
        statusFilter !== "all" ||
        assigneeFilter !== "all";

    const getActiveFilterCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (priorityFilter !== "all") count++;
        if (statusFilter !== "all") count++;
        if (assigneeFilter !== "all") count++;
        return count;
    };

    return (
        <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects... (e.g., P-25082001 or 'connector housing')"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => onSearchChange("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filter
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                            {getActiveFilterCount()}
                        </Badge>
                    )}
                </Button>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Priority:</label>
                        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Status:</label>
                        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="inquiry_received">Inquiry Received</SelectItem>
                                <SelectItem value="technical_review">Technical Review</SelectItem>
                                <SelectItem value="supplier_rfq_sent">Supplier RFQ Sent</SelectItem>
                                <SelectItem value="quoted">Quoted</SelectItem>
                                <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
                                <SelectItem value="in_production">In Production</SelectItem>
                                <SelectItem value="shipped_closed">Shipped & Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Assignee:</label>
                        <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="mine">Mine</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Showing {projectsCount} project{projectsCount !== 1 ? 's' : ''}
                    {hasActiveFilters && ' (filtered)'}
                </span>
                {hasActiveFilters && (
                    <div className="flex gap-2">
                        {searchQuery && (
                            <Badge variant="outline" className="text-xs">
                                Search: "{searchQuery}"
                            </Badge>
                        )}
                        {priorityFilter !== "all" && (
                            <Badge variant="outline" className="text-xs">
                                Priority: {priorityFilter}
                            </Badge>
                        )}
                        {statusFilter !== "all" && (
                            <Badge variant="outline" className="text-xs">
                                Status: {statusFilter.replace('_', ' ')}
                            </Badge>
                        )}
                        {assigneeFilter !== "all" && (
                            <Badge variant="outline" className="text-xs">
                                Assignee: {assigneeFilter}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}