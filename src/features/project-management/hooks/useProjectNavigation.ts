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
    const navigationTabs = useMemo(() => [
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
            badge: documentsPendingApproval > 0 ? documentsPendingApproval : undefined,
            hasNotifications: documentsPendingApproval > 0,
            loading: navigationState.tabLoadingStates.documents,
            error: navigationState.tabErrorStates.documents,
        },
        {
            id: 'messages',
            label: 'Messages',
            icon: MessageSquare,
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
            hasNotifications: unreadMessagesCount > 0,
            loading: navigationState.tabLoadingStates.messages,
            error: navigationState.tabErrorStates.messages,
        },
        {
            id: 'suppliers',
            label: 'Suppliers',
            icon: Package,
            badge: activeSupplierRfqsCount > 0 ? activeSupplierRfqsCount : undefined,
            hasNotifications: activeSupplierRfqsCount > 0,
            loading: navigationState.tabLoadingStates.suppliers,
            error: navigationState.tabErrorStates.suppliers,
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
        }
    ], [navigationState, documentsPendingApproval, unreadMessagesCount, pendingReviewsCount, activeSupplierRfqsCount]);

    // Navigation actions
    const setActiveTab = (tabId: string) => {
        setNavigationState(prev => ({
            ...prev,
            activeTab: tabId,
            lastVisitedTabs: {
                ...prev.lastVisitedTabs,
                [tabId]: new Date().toISOString()
            }
        }));
    };

    const setTabLoading = (tabId: string, loading: boolean) => {
        setNavigationState(prev => ({
            ...prev,
            tabLoadingStates: {
                ...prev.tabLoadingStates,
                [tabId]: loading
            }
        }));
    };

    const setTabError = (tabId: string, hasError: boolean) => {
        setNavigationState(prev => ({
            ...prev,
            tabErrorStates: {
                ...prev.tabErrorStates,
                [tabId]: hasError
            }
        }));
    };

    const clearTabStates = () => {
        setNavigationState(prev => ({
            ...prev,
            tabLoadingStates: {},
            tabErrorStates: {}
        }));
    };

    const getTabStats = () => {
        const totalTabs = navigationTabs.length;
        const loadingTabs = Object.values(navigationState.tabLoadingStates).filter(Boolean).length;
        const errorTabs = Object.values(navigationState.tabErrorStates).filter(Boolean).length;
        const notificationTabs = navigationTabs.filter(tab => tab.hasNotifications).length;

        return {
            totalTabs,
            loadingTabs,
            errorTabs,
            notificationTabs,
            healthyTabs: totalTabs - loadingTabs - errorTabs
        };
    };

    return {
        activeTab: navigationState.activeTab,
        navigationTabs,
        setActiveTab,
        setTabLoading,
        setTabError,
        clearTabStates,
        getTabStats,
        lastVisitedTabs: navigationState.lastVisitedTabs
    };
};
