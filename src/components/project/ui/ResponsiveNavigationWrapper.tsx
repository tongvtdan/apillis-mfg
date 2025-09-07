import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { InteractiveNavigationSidebar, NavigationTab } from './InteractiveNavigationSidebar';

interface ResponsiveNavigationWrapperProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabs: NavigationTab[];
    projectId?: string;
    projectTitle?: string;
    onBack?: () => void;
    children: React.ReactNode;
    className?: string;
}

export const ResponsiveNavigationWrapper: React.FC<ResponsiveNavigationWrapperProps> = ({
    activeTab,
    onTabChange,
    tabs,
    projectId,
    projectTitle,
    onBack,
    children,
    className
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Detect screen size changes
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768); // md breakpoint
            setIsTablet(width >= 768 && width < 1024); // lg breakpoint
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close mobile menu when tab changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeTab]);

    // Handle tab change with mobile menu closure
    const handleTabChange = (tabId: string) => {
        onTabChange(tabId);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    // Mobile Navigation (Sheet)
    const MobileNavigation = () => (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
                >
                    <Menu className="w-4 h-4" />
                    <span className="sr-only">Open navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
                <InteractiveNavigationSidebar
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    tabs={tabs}
                    projectId={projectId}
                    projectTitle={projectTitle}
                    onBack={onBack}
                    className="w-full border-0"
                />
            </SheetContent>
        </Sheet>
    );

    // Tablet Navigation (Collapsible)
    const TabletNavigation = () => {
        const [isCollapsed, setIsCollapsed] = useState(false);

        return (
            <div className={cn(
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-64"
            )}>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute top-4 right-2 z-10"
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                    <InteractiveNavigationSidebar
                        activeTab={activeTab}
                        onTabChange={onTabChange}
                        tabs={tabs}
                        projectId={projectId}
                        projectTitle={projectTitle}
                        onBack={onBack}
                        className={cn(
                            "transition-all duration-300",
                            isCollapsed && "w-16 overflow-hidden"
                        )}
                    />
                </div>
            </div>
        );
    };

    // Desktop Navigation (Full sidebar)
    const DesktopNavigation = () => (
        <InteractiveNavigationSidebar
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabs={tabs}
            projectId={projectId}
            projectTitle={projectTitle}
            onBack={onBack}
        />
    );

    return (
        <div className={cn("flex min-h-screen bg-background", className)}>
            {/* Mobile Navigation */}
            {isMobile && <MobileNavigation />}

            {/* Tablet Navigation */}
            {isTablet && !isMobile && <TabletNavigation />}

            {/* Desktop Navigation */}
            {!isMobile && !isTablet && <DesktopNavigation />}

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col",
                isMobile ? "ml-0" : "" // No margin on mobile since sidebar is in sheet
            )}>
                {/* Mobile Header Spacer */}
                {isMobile && <div className="h-16" />}

                {/* Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};