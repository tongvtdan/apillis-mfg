import React from "react";
import { Bell, Search, LogOut, Settings, HelpCircle, UserCircle } from "lucide-react";
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
import { SessionStatus } from "@/components/auth/SessionStatus";
import { DaisyUIThemeToggle } from "@/components/ui/daisyui-theme-toggle";
import { Link } from "react-router-dom";


export function AppHeader() {
  const { profile, signOut } = useAuth();


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
    <header className="AppHeader sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          {/* SidebarTrigger removed to prevent overlap with sidebar */}
        </div>

        <div className="flex flex-1 justify-center px-4">
          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, customers, or documents..."
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DaisyUIThemeToggle variant="icon" size="sm" />

          <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full hover:bg-sky-100">
            <Bell className="h-4 w-4 text-base-content" />
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600 text-white border-2 border-white">
              3
            </Badge>
          </Button>

          <SessionStatus />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full hover:bg-sky-100">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs text-base-content">
                    {profile ? getInitials(profile.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.name || 'User'}
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
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
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