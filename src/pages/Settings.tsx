import { useState } from "react";
import { useAuth } from "@/core/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Settings as SettingsIcon,
    Users,
    Bell,
    Shield,
    Activity,
    Info,
    FileText,
    Calendar,
    CheckCircle,
    AlertCircle,
    Wrench,
} from "lucide-react";
import { getLatestReleaseNotes } from "@/data/releaseNotes";

// App version information
const APP_VERSION = "0.1.5";
const APP_NAME = "Apillis - Factory Pulse";


// This component displays user settings and profile information
// It uses the authenticated user's profile data from the AuthContext
// The profile data is fetched from the public.users table and connected to the auth.users table
// through the user ID which is consistent between both tables after the migration
export default function Settings() {
    const { profile, user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("general");

    const isManagement = profile?.role === "management" || profile?.role === "admin";





    // Show loading state while profile is being fetched
    if (loading) {
        return (
            <div className="space-y-6 p-6 bg-base-100 text-base-content min-h-screen">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-base-content/70">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if no user is authenticated
    if (!user) {
        return (
            <div className="space-y-6 p-6 bg-base-100 text-base-content min-h-screen">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
                        <p className="text-base-content/70">Please log in to access settings.</p>
                    </div>
                </div>
            </div>
        );
    }

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
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        General
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
                                        {profile?.name || "Not set"}
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
                                    <Badge variant={profile?.status === "active" ? "default" : "secondary"}>
                                        {profile?.status || "Unknown"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Application Information
                            </CardTitle>
                            <CardDescription>
                                System version and application details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Application Name</label>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {APP_NAME}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Version</label>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        v{APP_VERSION}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Environment</label>
                                    <p className="text-sm text-base-content/70 mt-1">
                                        {import.meta.env.MODE || "development"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Build</label>
                                    <Badge variant="outline">
                                        Production Ready
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Release Notes Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    <h3 className="text-lg font-semibold">Release Notes</h3>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {getLatestReleaseNotes(5).map((release, index) => (
                                        <div key={release.version} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={index === 0 ? "default" : "secondary"}>
                                                        v{release.version}
                                                    </Badge>
                                                    {index === 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Latest
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-base-content/60">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(release.date).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-base">{release.title}</h4>
                                                <p className="text-sm text-base-content/70 mt-1">{release.description}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                                {release.features && release.features.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-1 font-medium text-green-600 mb-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Features
                                                        </div>
                                                        <ul className="space-y-1 text-base-content/70">
                                                            {release.features.slice(0, 3).map((feature, idx) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="text-green-500 mt-0.5">•</span>
                                                                    <span>{feature}</span>
                                                                </li>
                                                            ))}
                                                            {release.features.length > 3 && (
                                                                <li className="text-base-content/50">
                                                                    +{release.features.length - 3} more...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {release.improvements && release.improvements.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-1 font-medium text-blue-600 mb-1">
                                                            <Wrench className="h-3 w-3" />
                                                            Improvements
                                                        </div>
                                                        <ul className="space-y-1 text-base-content/70">
                                                            {release.improvements.slice(0, 3).map((improvement, idx) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="text-blue-500 mt-0.5">•</span>
                                                                    <span>{improvement}</span>
                                                                </li>
                                                            ))}
                                                            {release.improvements.length > 3 && (
                                                                <li className="text-base-content/50">
                                                                    +{release.improvements.length - 3} more...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {release.bugFixes && release.bugFixes.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-1 font-medium text-orange-600 mb-1">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Bug Fixes
                                                        </div>
                                                        <ul className="space-y-1 text-base-content/70">
                                                            {release.bugFixes.slice(0, 3).map((fix, idx) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="text-orange-500 mt-0.5">•</span>
                                                                    <span>{fix}</span>
                                                                </li>
                                                            ))}
                                                            {release.bugFixes.length > 3 && (
                                                                <li className="text-base-content/50">
                                                                    +{release.bugFixes.length - 3} more...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                    <Card className="border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2 text-primary">
                                                <Users className="h-4 w-4" />
                                                User Management
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-base-content/70 mb-3">
                                                Manage user accounts, assign roles, and control permissions across the system.
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <a
                                                    href="/users"
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Open User Management
                                                </a>
                                                <p className="text-xs text-base-content/60">
                                                    • Change user roles and permissions<br />
                                                    • Manage account status and access<br />
                                                    • View user activity and audit logs
                                                </p>
                                            </div>
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


            </Tabs>
        </div>
    );
}