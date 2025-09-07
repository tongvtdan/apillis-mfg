import { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    BarChart3,
    Settings,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Package
} from 'lucide-react';
import { InteractiveNavigationSidebar } from '@/components/project/ui';
export const NavigationTab = InteractiveNavigationSidebar;

interface UseProjectNavigationProps {
    projectId: string;
    documentsCount?: number;
    documentsPendingApproval?: number;
    messagesCount?: number;
    unreadMessagesCount?: number;
    reviewsCount?: number;
    pendingReviewsCount?: number;
    supplierRfqsCount?: number;
    activeSupplierRfqsCount?: number;
}

interface NavigationState {
    activeTab: string;
    tabLoadingStates: Record<string, boolean>;
    tabErrorStates: Record<string, boolean>;
    lastVisitedTabs: Record<string, string>;
}

export const useProjectNavigation = ({
    projectId,
    documentsCount = 0,
    documentsPendingApproval = 0,
    messagesCount = 0,
    unreadMessagesCount = 0,
    reviewsCount = 0,
    pendingReviewsCount = 0,
    supplierRfqsCount = 0,
    activeSupplierRfqsCount = 0,
}: UseProjectNavigationProps) => {
    const [navigationState, setNavigationState] = useState<NavigationState>(() => {
        // Initialize from session storage
        const savedTab = sessionStorage.getItem(`project-${projectId}-active-tab`);
        const savedStates = sessionStorage.getItem(`project-${projectId}-nav-states`);

        let parsedStates = {};
        if (savedStates) {
            try {
                parsedStates = JSON.parse(savedStates);
            } catch (error) {
                console.warn('Failed to parse saved navigation states:', error);
            }
        }

        return {
            activeTab: savedTab || 'overview',
            tabLoadingStates: {},
            tabErrorStates: {},
            lastVisitedTabs: {},
            ...parsedStates,
        };
    });

    // Persist navigation state to session storage
    useEffect(() => {
        sessionStorage.setItem(`project-${projectId}-active-tab`, navigationState.activeTab);
        sessionStorage.setItem(`project-${projectId}-nav-states`, JSON.stringify({
            tabLoadingStates: navigationState.tabLoadingStates,
            tabErrorStates: navigationState.tabErrorStates,
            lastVisitedTabs: navigationState.lastVisitedTabs,
        }));
    }, [projectId, navigationState]);

    // Define navigation tabs with dynamic badges and states
    const navigationTabs: NavigationTab[] = useMemo(() => [
        {
            id: 'overview',
            label: 'Overview',
            icon: LayoutDashboard,
            loading: navigationState.tabLoadingStates.overview,
            error: navigationState.tabErrorStates.overview,
        },
        {
            id: 'reviews',
            label: 'Reviews',
            icon: CheckCircle2,
            badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
            hasNotifications: pendingReviewsCount > 0,
            loading: navigationState.tabLoadingStates.reviews,
            error: navigationState.tabErrorStates.reviews,
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: FileText,
            badge: documentsCount > 0 ? documentsCount : undefined,
            hasNotifications: documentsPendingApproval > 0,
            loading: navigationState.tabLoadingStates.documents,
            error: navigationState.tabErrorStates.documents,
        },
        {
            id: 'supplier',
            label: 'Supplier RFQs',
            icon: Package,
            badge: activeSupplierRfqsCount > 0 ? activeSupplierRfqsCount : undefined,
            hasNotifications: activeSupplierRfqsCount > 0,
            loading: navigationState.tabLoadingStates.supplier,
            error: navigationState.tabErrorStates.supplier,
        },
        {
            id: 'communication',
            label: 'Communication',
            icon: MessageSquare,
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
            hasNotifications: unreadMessagesCount > 0,
            loading: navigationState.tabLoadingStates.communication,
            error: navigationState.tabErrorStates.communication,
        },
        {
            id: 'timeline',
            label: 'Timeline',
            icon: Clock,
            loading: navigationState.tabLoadingStates.timeline,
            error: navigationState.tabErrorStates.timeline,
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            loading: navigationState.tabLoadingStates.analytics,
            error: navigationState.tabErrorStates.analytics,
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            loading: navigationState.tabLoadingStates.settings,
            error: navigationState.tabErrorStates.settings,
        },
    ], [
        navigationState.tabLoadingStates,
        navigationState.tabErrorStates,
        documentsCount,
        documentsPendingApproval,
        messagesCount,
        unreadMessagesCount,
        reviewsCount,
        pendingReviewsCount,
        supplierRfqsCount,
        activeSupplierRfqsCount,
    ]);

    // Tab change handler with immediate state update
    const handleTabChange = async (tabId: string) => {
        // Update active tab immediately since data is already loaded
        setNavigationState(prev => ({
            ...prev,
            activeTab: tabId,
            tabLoadingStates: {
                ...prev.tabLoadingStates,
                [tabId]: false,
            },
            tabErrorStates: {
                ...prev.tabErrorStates,
                [tabId]: false,
            },
            lastVisitedTabs: {
                ...prev.lastVisitedTabs,
                [tabId]: new Date().toISOString(),
            },
        }));

        return true;
    };

    // Clear error state for a tab
    const clearTabError = (tabId: string) => {
        setNavigationState(prev => ({
            ...prev,
            tabErrorStates: {
                ...prev.tabErrorStates,
                [tabId]: false,
            },
        }));
    };

    // Set loading state for a tab
    const setTabLoading = (tabId: string, loading: boolean) => {
        setNavigationState(prev => ({
            ...prev,
            tabLoadingStates: {
                ...prev.tabLoadingStates,
                [tabId]: loading,
            },
        }));
    };

    // Get breadcrumbs based on active tab
    const getBreadcrumbs = () => {
        const activeTab = navigationTabs.find(tab => tab.id === navigationState.activeTab);
        if (!activeTab) return [];

        return [
            { label: activeTab.label }
        ];
    };

    return {
        activeTab: navigationState.activeTab,
        navigationTabs,
        handleTabChange,
        clearTabError,
        setTabLoading,
        getBreadcrumbs,
        isTabLoading: (tabId: string) => navigationState.tabLoadingStates[tabId] || false,
        hasTabError: (tabId: string) => navigationState.tabErrorStates[tabId] || false,
        lastVisitedTabs: navigationState.lastVisitedTabs,
    };
};