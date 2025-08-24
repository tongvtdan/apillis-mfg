import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
    Settings as SettingsIcon,
    Database,
    Users,
    Palette,
    Bell,
    Shield,
    Activity,
    Info,
} from "lucide-react";

export default function Settings() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState("general");

    const isManagement = profile?.role === "Management";
    const isDev = import.meta.env.DEV;

    return (
        <div className="space-y-6 p-6 bg-base-100 text-base-content min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8 text-base-content" />
                    Settings
                </h1>
                <p className="text-base-content/70 mt-1">
                    Manage your application preferences and system configuration.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    {isManagement && (
                        <TabsTrigger value="admin" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                        </TabsTrigger>
                    )}
                    {isDev && (
                        <TabsTrigger value="development" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Development
                            <Badge variant="secondary" className="ml-1">DEV</Badge>
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Your account information and preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Display Name</label>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {profile?.display_name || "Not set"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content">Role</label>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {profile?.role || "Not assigned"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-base-content">Department</label>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {profile?.department || "Not assigned"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge variant={profile?.status === "Active" ? "default" : "secondary"}>
                                        {profile?.status || "Unknown"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme & Display
                            </CardTitle>
                            <CardDescription>
                                Customize the appearance of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium">Theme</label>
                                    <p className="text-xs text-base-content/70 mt-1">
                                        Choose between light and dark mode
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Configure how you receive notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-base-content/70">
                                Notification settings will be available in a future update.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Admin Settings */}
                {isManagement && (
                    <TabsContent value="admin" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Administrative Tools
                                </CardTitle>
                                <CardDescription>
                                    Management tools and system administration.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border-dashed">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                User Management
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-base-content/70 mb-3">
                                                Manage user accounts, roles, and permissions.
                                            </p>
                                            <a
                                                href="/admin/users"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Go to User Management →
                                            </a>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-dashed">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                System Monitoring
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-base-content/70 mb-3">
                                                Monitor system performance and activity logs.
                                            </p>
                                            <span className="text-sm text-base-content/70">
                                                Coming soon...
                                            </span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Development Settings */}
                {isDev && (
                    <TabsContent value="development" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Development Tools
                                    <Badge variant="outline">Development Only</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Development tools and database management utilities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 rounded-lg">
                                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                                            ⚠️ Development Environment Only
                                        </h4>
                                        <p className="text-xs text-orange-700 dark:text-orange-300">
                                            These tools are only available in development mode and will not be visible in production.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium mb-4">Development Tools</h3>
                                        <p className="text-sm text-base-content/70">
                                            Development tools will be available in a future update.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}