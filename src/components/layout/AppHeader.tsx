import React, { useState, useEffect } from "react";
import { Bell, Search, LogOut, Settings, HelpCircle, UserCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { ProjectUpdateAnimation } from "@/components/project/ProjectUpdateAnimation";

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const isProjectsPage = location.pathname === '/projects';
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("Updating project status...");

  // Listen for custom events to show/hide the update animation
  useEffect(() => {
    const handleShowUpdate = (event: CustomEvent) => {
      setUpdateMessage(event.detail?.message || "Updating project status...");
      setShowUpdateAnimation(true);
    };
    const handleHideUpdate = () => setShowUpdateAnimation(false);

    window.addEventListener('show-project-update', handleShowUpdate as EventListener);
    window.addEventListener('hide-project-update', handleHideUpdate);

    return () => {
      window.removeEventListener('show-project-update', handleShowUpdate as EventListener);
      window.removeEventListener('hide-project-update', handleHideUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          {/* SidebarTrigger removed to prevent overlap with sidebar */}
        </div>

        <div className="flex flex-1 justify-center px-4">
          <div className="flex items-center gap-3">
            <ProjectUpdateAnimation isVisible={showUpdateAnimation} message={updateMessage} variant="inline" />
            <div className="relative w-64 md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RFQs, customers, or documents..."
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isProjectsPage && (
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/rfq/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {profile ? getInitials(profile.display_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.role || 'Loading...'}
                  </p>
                  {profile?.department && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.department}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}