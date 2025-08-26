import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Eye, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Project, ProjectStatus, PROJECT_STAGES } from "@/types/project";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";

interface ProjectCalendarProps {
    projects: Project[];
    projectTypeFilter?: string;
}

interface CalendarDay {
    date: Date;
    projects: Project[];
    isCurrentMonth: boolean;
    isToday: boolean;
}

interface CalendarWeek {
    days: CalendarDay[];
}

export function ProjectCalendar({ projects, projectTypeFilter = 'all' }: ProjectCalendarProps) {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Filter projects by type if specified
    const filteredProjects = useMemo(() => {
        if (projectTypeFilter === 'all') return projects;
        return projects.filter(p => p.project_type === projectTypeFilter);
    }, [projects, projectTypeFilter]);

    // Get projects for a specific date
    const getProjectsForDate = (date: Date): Project[] => {
        return filteredProjects.filter(project => {
            // Check due date
            if (project.due_date && isSameDay(new Date(project.due_date), date)) {
                return true;
            }

            // Check if project was created on this date
            if (project.created_at && isSameDay(new Date(project.created_at), date)) {
                return true;
            }

            // Check if project status changed on this date (approximation)
            if (project.stage_entered_at && isSameDay(new Date(project.stage_entered_at), date)) {
                return true;
            }

            return false;
        });
    };

    // Generate calendar data
    const calendarData = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        const weeks: CalendarWeek[] = [];
        const weekStarts = eachWeekOfInterval({ start: calendarStart, end: calendarEnd });

        weekStarts.forEach(weekStart => {
            const weekEnd = endOfWeek(weekStart);
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

            const weekDays: CalendarDay[] = days.map(date => ({
                date,
                projects: getProjectsForDate(date),
                isCurrentMonth: isSameMonth(date, currentMonth),
                isToday: isToday(date)
            }));

            weeks.push({ days: weekDays });
        });

        return weeks;
    }, [currentMonth, filteredProjects]);

    // Navigate to previous/next month
    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    // Get project status color
    const getProjectStatusColor = (status: ProjectStatus) => {
        const stage = PROJECT_STAGES.find(s => s.id === status);
        return stage?.color || 'bg-gray-100 text-gray-800';
    };

    // Get project priority color
    const getPriorityColor = (priority: string) => {
        const priorityColors: Record<string, string> = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Check if project is overdue
    const isProjectOverdue = (project: Project) => {
        if (!project.due_date) return false;
        const dueDate = new Date(project.due_date);
        const today = new Date();
        return dueDate < today && project.status !== 'shipped_closed';
    };

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Project Calendar</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                View projects by due dates, milestones, and timeline
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToToday}
                                className="text-xs"
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Month/Year Display */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-primary">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                    </div>
                </CardHeader>
            </Card>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-6">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarData.map((week, weekIndex) => (
                            <React.Fragment key={weekIndex}>
                                {week.days.map((day, dayIndex) => (
                                    <motion.div
                                        key={dayIndex}
                                        className={`
                                            min-h-[120px] p-2 border border-muted-foreground/20 rounded-lg
                                            ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                                            ${day.isToday ? 'ring-2 ring-primary ring-opacity-50' : ''}
                                            transition-all duration-200 hover:shadow-md
                                        `}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Date Number */}
                                        <div className={`
                                            text-sm font-medium mb-2 text-center
                                            ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'}
                                            ${day.isToday ? 'text-primary font-bold' : ''}
                                        `}>
                                            {format(day.date, 'd')}
                                        </div>

                                        {/* Projects for this day */}
                                        <div className="space-y-1">
                                            <AnimatePresence>
                                                {day.projects.map((project, projectIndex) => (
                                                    <motion.div
                                                        key={`${project.id}-${projectIndex}`}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="group"
                                                    >
                                                        <div
                                                            className={`
                                                                p-2 rounded text-xs cursor-pointer
                                                                ${isProjectOverdue(project)
                                                                    ? 'bg-red-100 border border-red-200 hover:bg-red-200'
                                                                    : 'bg-primary/10 border border-primary/20 hover:bg-primary/20'
                                                                }
                                                                transition-all duration-200
                                                            `}
                                                            onClick={() => navigate(`/project/${project.id}`)}
                                                        >
                                                            {/* Project Header */}
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium truncate">
                                                                    {project.project_id}
                                                                </span>
                                                                <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                            </div>

                                                            {/* Project Title */}
                                                            <div className="text-xs text-muted-foreground mb-1 truncate">
                                                                {project.title}
                                                            </div>

                                                            {/* Project Status and Priority */}
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs ${getProjectStatusColor(project.status)}`}
                                                                >
                                                                    {PROJECT_STAGES.find(s => s.id === project.status)?.name || project.status}
                                                                </Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs ${getPriorityColor(project.priority)}`}
                                                                >
                                                                    {project.priority}
                                                                </Badge>
                                                            </div>

                                                            {/* Due Date Indicator */}
                                                            {project.due_date && (
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    {isProjectOverdue(project) ? (
                                                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                                                    ) : (
                                                                        <Clock className="h-3 w-3 text-blue-500" />
                                                                    )}
                                                                    <span className={isProjectOverdue(project) ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                                                                        {format(new Date(project.due_date), 'MMM d')}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Empty State */}
                                        {day.projects.length === 0 && day.isCurrentMonth && (
                                            <div className="text-center text-xs text-muted-foreground/50 mt-4">
                                                No projects
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Legend */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
                            <span>Active Projects</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                            <span>Overdue Projects</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-muted/30 border border-muted-foreground/20 rounded"></div>
                            <span>Other Month</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary ring-2 ring-primary/50 rounded"></div>
                            <span>Today</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
