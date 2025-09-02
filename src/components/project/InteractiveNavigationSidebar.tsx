import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    MoreHorizontal,
    Bell,
    Settings,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NavigationTab {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
    hasNotifications?: boolean;
}

interface InteractiveNavigationSidebarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabs: NavigationTab[];
    projectId?: string;
    projectTitle?: string;
    onBack?: () => void;
    className?: string;
}

export const InteractiveNavigationSidebar: React.FC<InteractiveNavigationSidebarProps> = ({
    activeTab,
    onTabChange,
    tabs,
    projectId,
    projectTitle,
    onBack,
    className
}) => {
    const [tabStates, setTabStates] = useState<Record<string, { loading: boolean; error: boolean }>>({});

    const handleTabClick = (tab: NavigationTab) => {
        if (tab.disabled) return;
        onTabChange(tab.id);
    };

    const getTabIcon = (tab: NavigationTab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        const state = tabStates[tab.id];

        if (state?.loading || tab.loading) {
            return <Loader2 className="w-4 h-4 animate-spin" />;
        }

        if (state?.error || tab.error) {
            return <AlertCircle className="w-4 h-4 text-destructive" />;
        }

        return (
            <IconComponent
                className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
            />
        );
    };

    const getTabBadge = (tab: NavigationTab) => {
        if (!tab.badge && !tab.hasNotifications) return null;

        return (
            <div className="flex items-center space-x-1">
                {tab.hasNotifications && (
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                )}
                {tab.badge && (
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center",
                            activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : ""
                        )}
                    >
                        {tab.badge > 99 ? '99+' : tab.badge}
                    </Badge>
                )}
            </div>
        );
    };

    const renderSecondaryActions = () => {
        const activeTabData = tabs.find(tab => tab.id === activeTab);
        if (!activeTabData) return null;

        return (
            <div className="px-4 py-2 border-b border-border">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                            Actions
                            <MoreHorizontal className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem className="text-xs">
                            <FileText className="w-3 h-3 mr-2" />
                            Export {activeTabData.label}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">
                            <Bell className="w-3 h-3 mr-2" />
                            Set Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs">
                            <Settings className="w-3 h-3 mr-2" />
                            Configure View
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    };

    return (
        <div className={cn("w-64 border-r bg-card shadow-sm min-h-screen flex flex-col", className)}>
            {/* Navigation Tabs */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <div className="mb-4 text-xs font-bold text-primary uppercase tracking-wider py-2 border-b border-muted">
                        NAVIGATION
                    </div>
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab)}
                                    disabled={tab.disabled}
                                    className={cn(
                                        "group w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                            : tab.disabled
                                                ? "text-muted-foreground/50 cursor-not-allowed"
                                                : "text-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        {getTabIcon(tab)}
                                        <span className="truncate">{tab.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getTabBadge(tab)}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Secondary Actions */}
            {renderSecondaryActions()}

            {/* Footer with Status */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last updated</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};