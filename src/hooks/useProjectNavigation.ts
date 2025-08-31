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
import { NavigationTab } from '@/components/project/InteractiveNavigationSidebar';

interface UseProjectNavigationProps {
    projectId: string;
    documentsCount?: number;
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
            subTabs: [
                {
                    id: 'reviews-engineering',
                    label: 'Engineering',
                    badge: 1, // This would be calculated based on actual review status
                },
                {
                    id: 'reviews-qa',
                    label: 'Quality Assurance',
                },
                {
                    id: 'reviews-production',
                    label: 'Production',
                },
            ],
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: FileText,
            badge: documentsCount > 0 ? documentsCount : undefined,
            loading: navigationState.tabLoadingStates.documents,
            error: navigationState.tabErrorStates.documents,
            subTabs: [
                {
                    id: 'documents-technical',
                    label: 'Technical Drawings',
                },
                {
                    id: 'documents-specifications',
                    label: 'Specifications',
                },
                {
                    id: 'documents-quotes',
                    label: 'Quotes & Proposals',
                },
            ],
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
            subTabs: [
                {
                    id: 'communication-internal',
                    label: 'Internal Messages',
                    badge: unreadMessagesCount > 0 ? Math.ceil(unreadMessagesCount / 2) : undefined,
                },
                {
                    id: 'communication-customer',
                    label: 'Customer Communication',
                },
                {
                    id: 'communication-supplier',
                    label: 'Supplier Communication',
                },
            ],
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
            subTabs: [
                {
                    id: 'analytics-performance',
                    label: 'Performance Metrics',
                },
                {
                    id: 'analytics-timeline',
                    label: 'Timeline Analysis',
                },
                {
                    id: 'analytics-costs',
                    label: 'Cost Analysis',
                },
            ],
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
        messagesCount,
        unreadMessagesCount,
        reviewsCount,
        pendingReviewsCount,
        supplierRfqsCount,
        activeSupplierRfqsCount,
    ]);

    // Tab change handler with loading state management
    const handleTabChange = async (tabId: string) => {
        // Set loading state
        setNavigationState(prev => ({
            ...prev,
            tabLoadingStates: {
                ...prev.tabLoadingStates,
                [tabId]: true,
            },
            tabErrorStates: {
                ...prev.tabErrorStates,
                [tabId]: false,
            },
        }));

        try {
            // Simulate async tab loading (replace with actual data loading logic)
            await new Promise(resolve => setTimeout(resolve, 300));

            // Update active tab and clear loading state
            setNavigationState(prev => ({
                ...prev,
                activeTab: tabId,
                tabLoadingStates: {
                    ...prev.tabLoadingStates,
                    [tabId]: false,
                },
                lastVisitedTabs: {
                    ...prev.lastVisitedTabs,
                    [tabId]: new Date().toISOString(),
                },
            }));

            return true;
        } catch (error) {
            console.error('Failed to load tab:', tabId, error);

            // Set error state
            setNavigationState(prev => ({
                ...prev,
                tabLoadingStates: {
                    ...prev.tabLoadingStates,
                    [tabId]: false,
                },
                tabErrorStates: {
                    ...prev.tabErrorStates,
                    [tabId]: true,
                },
            }));

            return false;
        }
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

        const breadcrumbs = [
            { label: activeTab.label }
        ];

        // Add sub-tab breadcrumb if applicable
        const subTab = activeTab.subTabs?.find(sub => sub.id === navigationState.activeTab);
        if (subTab) {
            breadcrumbs.push({ label: subTab.label });
        }

        return breadcrumbs;
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