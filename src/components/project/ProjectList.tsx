import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Plus,
    X,
    SortAsc,
    SortDesc,
    Calendar,
    User,
    Building2,
    DollarSign,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Project, ProjectStatus, ProjectPriority, WorkflowStage } from '@/types/project';
import { ProjectTable } from './ProjectTable';
import { useUserDisplayName } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProjectListProps {
    projects: Project[];
    workflowStages: WorkflowStage[];
    loading?: boolean;
    onProjectUpdate?: (projectId: string, updates: Partial<Project>) => Promise<void>;
    onProjectCreate?: (projectData: any) => Promise<Project>;
}

interface FilterState {
    search: string;
    stage: string;
    priority: string;
    assignee: string;
    status: string;
    dateRange: string;
}

type SortField = 'title' | 'created_at' | 'priority_level' | 'estimated_value' | 'estimated_delivery_date';
type SortDirection = 'asc' | 'desc';

export function ProjectList({
    projects,
    workflowStages,
    loading = false,
    onProjectUpdate,
    onProjectCreate
}: EnhancedProjectListProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        stage: 'all',
        priority: 'all',
        assignee: 'all',
        status: 'all',
        dateRange: 'all'
    });

    // Sort state
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Get unique assignees for filter dropdown - using individual user lookups
    const assigneeIds = useMemo(() => {
        const ids = projects
            .map(p => p.assigned_to || p.assignee_id)
            .filter(Boolean)
            .filter((id, index, arr) => arr.indexOf(id) === index);
        return ids as string[];
    }, [projects]);

    // Remove useUsers hook since we're using individual useUserDisplayName calls

    // Filter and search logic
    const filteredProjects = useMemo(() => {
        let filtered = [...projects];

        // Text search across multiple fields
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(project =>
                project.project_id?.toLowerCase().includes(searchLower) ||
                project.title?.toLowerCase().includes(searchLower) ||
                project.description?.toLowerCase().includes(searchLower) ||
                project.customer_organization?.name?.toLowerCase().includes(searchLower) ||
                project.customer?.company_name?.toLowerCase().includes(searchLower) ||
                project.customer?.contact_name?.toLowerCase().includes(searchLower) ||
                project.contact_name?.toLowerCase().includes(searchLower) ||
                project.notes?.toLowerCase().includes(searchLower) ||
                project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Stage filter
        if (filters.stage !== 'all') {
            filtered = filtered.filter(project => project.current_stage_id === filters.stage);
        }

        // Priority filter
        if (filters.priority !== 'all') {
            filtered = filtered.filter(project =>
                (project.priority_level || project.priority) === filters.priority
            );
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(project => project.status === filters.status);
        }

        // Assignee filter
        if (filters.assignee !== 'all') {
            if (filters.assignee === 'unassigned') {
                filtered = filtered.filter(project =>
                    !project.assigned_to && !project.assignee_id
                );
            } else {
                filtered = filtered.filter(project =>
                    project.assigned_to === filters.assignee ||
                    project.assignee_id === filters.assignee
                );
            }
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(project =>
                        new Date(project.created_at || '') >= filterDate
                    );
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(project =>
                        new Date(project.created_at || '') >= filterDate
                    );
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(project =>
                        new Date(project.created_at || '') >= filterDate
                    );
                    break;
                case 'overdue':
                    filtered = filtered.filter(project =>
                        project.estimated_delivery_date &&
                        new Date(project.estimated_delivery_date) < now
                    );
                    break;
            }
        }

        return filtered;
    }, [projects, filters]);

    // Sort logic
    const sortedProjects = useMemo(() => {
        const sorted = [...filteredProjects].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'title':
                    aValue = a.title?.toLowerCase() || '';
                    bValue = b.title?.toLowerCase() || '';
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at || 0);
                    bValue = new Date(b.created_at || 0);
                    break;
                case 'priority_level':
                    const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
                    aValue = priorityOrder[(a.priority_level || a.priority || 'normal') as keyof typeof priorityOrder];
                    bValue = priorityOrder[(b.priority_level || b.priority || 'normal') as keyof typeof priorityOrder];
                    break;
                case 'estimated_value':
                    aValue = a.estimated_value || 0;
                    bValue = b.estimated_value || 0;
                    break;
                case 'estimated_delivery_date':
                    aValue = new Date(a.estimated_delivery_date || '9999-12-31');
                    bValue = new Date(b.estimated_delivery_date || '9999-12-31');
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredProjects, sortField, sortDirection]);

    // Filter handlers
    const updateFilter = useCallback((key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            search: '',
            stage: 'all',
            priority: 'all',
            assignee: 'all',
            status: 'all',
            dateRange: 'all'
        });
    }, []);

    // Sort handlers
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return Object.entries(filters).some(([key, value]) =>
            key !== 'search' ? value !== 'all' : value !== ''
        );
    }, [filters]);

    // Get active filter count
    const activeFilterCount = useMemo(() => {
        return Object.entries(filters).filter(([key, value]) =>
            key !== 'search' ? value !== 'all' : value !== ''
        ).length;
    }, [filters]);

    // Format currency
    const formatCurrency = (value: number | null) => {
        if (!value) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Projects</h2>
                    <p className="text-muted-foreground">
                        Manage and track your manufacturing projects
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center border rounded-lg p-1">
                        <Button
                            variant={viewMode === 'cards' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('cards')}
                            className="h-8 px-3"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="h-8 px-3"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Main Search Bar */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects, customers, or descriptions..."
                                    value={filters.search}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="pl-10"
                                />
                                {filters.search && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        onClick={() => updateFilter('search', '')}
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
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                                        {activeFilterCount}
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

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg border">
                                {/* Stage Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stage</label>
                                    <Select value={filters.stage} onValueChange={(value) => updateFilter('stage', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stages</SelectItem>
                                            {workflowStages.map(stage => (
                                                <SelectItem key={stage.id} value={stage.id}>
                                                    {stage.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Priority Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priorities</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assignee Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assignee</label>
                                    <Select value={filters.assignee} onValueChange={(value) => updateFilter('assignee', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Assignees</SelectItem>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {assigneeIds.map(userId => (
                                                <SelectItem key={userId} value={userId}>
                                                    <UserDisplayName userId={userId} />
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Range</label>
                                    <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2">
                                {filters.search && (
                                    <Badge variant="outline" className="text-xs">
                                        Search: "{filters.search}"
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => updateFilter('search', '')}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </Badge>
                                )}
                                {filters.stage !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Stage: {workflowStages.find(s => s.id === filters.stage)?.name}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => updateFilter('stage', 'all')}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </Badge>
                                )}
                                {filters.priority !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Priority: {filters.priority}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => updateFilter('priority', 'all')}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </Badge>
                                )}
                                {filters.status !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Status: {filters.status.replace('_', ' ')}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => updateFilter('status', 'all')}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </Badge>
                                )}
                                {filters.assignee !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Assignee: {filters.assignee === 'unassigned' ? 'Unassigned' :
                                            <UserDisplayName userId={filters.assignee} />}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => updateFilter('assignee', 'all')}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sort Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                        Showing {sortedProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
                        {hasActiveFilters && ' (filtered)'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Button
                        variant={sortField === 'title' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('title')}
                        className="h-7 text-xs"
                    >
                        Name
                        {sortField === 'title' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                        )}
                    </Button>
                    <Button
                        variant={sortField === 'created_at' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('created_at')}
                        className="h-7 text-xs"
                    >
                        Date
                        {sortField === 'created_at' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                        )}
                    </Button>
                    <Button
                        variant={sortField === 'priority_level' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('priority_level')}
                        className="h-7 text-xs"
                    >
                        Priority
                        {sortField === 'priority_level' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                        )}
                    </Button>
                    <Button
                        variant={sortField === 'estimated_value' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('estimated_value')}
                        className="h-7 text-xs"
                    >
                        Value
                        {sortField === 'estimated_value' && (
                            sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Project List Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-3 bg-muted rounded"></div>
                                    <div className="h-3 bg-muted rounded w-2/3"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : sortedProjects.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No projects found</h3>
                        <p className="text-muted-foreground mb-4">
                            {hasActiveFilters
                                ? "No projects match your current filters. Try adjusting your search criteria."
                                : "You haven't created any projects yet. Create your first project to get started."
                            }
                        </p>
                        <div className="flex justify-center gap-2">
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearAllFilters}>
                                    Clear Filters
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => navigate("/projects/new")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Project
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02] group"
                            style={{
                                borderLeftColor: workflowStages.find(s => s.id === project.current_stage_id)?.color || '#3B82F6'
                            }}
                        >
                            <CardContent className="p-6">
                                {/* Project Header */}
                                <div className="mb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <h4 className="font-semibold text-base text-base-content group-hover:text-primary transition-colors">
                                                    {project.project_id} - {project.title}
                                                </h4>
                                                {project.customer_organization?.name && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {project.customer_organization.name}
                                                    </p>
                                                )}
                                                {project.contact_points && project.contact_points.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Contact: {project.contact_points.find(cp => cp.is_primary)?.contact?.contact_name ||
                                                            project.contact_points[0]?.contact?.contact_name || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getPriorityColor(project.priority_level || project.priority || 'normal')}`}
                                        >
                                            {(project.priority_level || project.priority || 'normal').toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <AssigneeDisplay userId={project.assigned_to || project.assignee_id} />
                                        {project.estimated_value && (
                                            <div className="flex items-center space-x-1 font-medium">
                                                <DollarSign className="h-3 w-3 flex-shrink-0 text-green-600" />
                                                <span>{formatCurrency(project.estimated_value)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {project.estimated_delivery_date && (
                                            <div className="flex items-center space-x-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                                <span>{formatDate(project.estimated_delivery_date)}</span>
                                            </div>
                                        )}
                                        {project.days_in_stage && (
                                            <div className="flex items-center space-x-1 text-muted-foreground">
                                                <Clock className="h-3 w-3 flex-shrink-0" />
                                                <span>{project.days_in_stage} days in stage</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Current Stage */}
                                {project.current_stage && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Current Stage:</span>
                                            <Badge
                                                variant="outline"
                                                style={{
                                                    backgroundColor: project.current_stage.color + '20',
                                                    borderColor: project.current_stage.color,
                                                    color: project.current_stage.color
                                                }}
                                            >
                                                {project.current_stage.name}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {/* View Details Button */}
                                <div className="mt-4 pt-3 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/project/${project.id}`);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <ProjectTable
                    projects={sortedProjects}
                    workflowStages={workflowStages}
                    updateProjectStatusOptimistic={async (projectId, newStatus) => {
                        if (onProjectUpdate) {
                            await onProjectUpdate(projectId, { status: newStatus });
                            return true;
                        }
                        return false;
                    }}
                />
            )}
        </div>
    );
}

// Helper component to display user name
function UserDisplayName({ userId }: { userId: string }) {
    const displayName = useUserDisplayName(userId);
    return <>{displayName}</>;
}

// Helper component to display assignee name
function AssigneeDisplay({ userId }: { userId?: string }) {
    const displayName = useUserDisplayName(userId);
    return (
        <div className="flex items-center space-x-1 text-muted-foreground">
            <User className="h-3 w-3 flex-shrink-0" />
            <span>{displayName}</span>
        </div>
    );
}