import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    UserCircle,
    Edit,
    Save,
    X,
    Calendar,
    Shield,
    Building,
    Phone,
    Mail,
    Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
    const { profile, user, loading, updateUserProfile } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        department: profile?.department || '',
        phone: profile?.phone || '',
    });

    // Debug logging
    console.log('Profile component render - Current profile state:', profile);
    console.log('Profile component render - Current user state:', user);
    console.log('Profile component render - Loading state:', loading);

    const isManagement = profile?.role === "management" || profile?.role === "admin";

    // Show loading state while profile is being fetched
    if (loading) {
        return (
            <div className="space-y-6 p-6 bg-base-100 text-base-content min-h-screen">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-base-content/70">Loading profile...</p>
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
                        <p className="text-base-content/70">Please log in to access your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            await updateUserProfile(formData);
            setIsEditing(false);
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update profile. Please try again.",
            });
        }
    };

    const handleCancel = () => {
        setFormData({
            name: profile?.name || '',
            department: profile?.department || '',
            phone: profile?.phone || '',
        });
        setIsEditing(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    return (
        <div className="space-y-6 p-6 bg-base-100 text-base-content min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content flex items-center gap-2">
                    <UserCircle className="h-8 w-8 text-base-content" />
                    User Profile
                </h1>
                <p className="text-base-content/70 mt-1">
                    View and manage your personal information and account details.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold">
                                    {profile ? getInitials(profile.name) : 'U'}
                                </div>
                            </div>
                            <CardTitle className="text-xl">
                                {profile?.name || 'User'}
                            </CardTitle>
                            <CardDescription>
                                {profile?.role || 'Role not assigned'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <Badge variant={profile?.status === "active" ? "default" : "secondary"}>
                                    {profile?.status || "Unknown"}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="font-medium">{user.email}</span>
                                </div>

                                {profile?.department && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Department:</span>
                                        <span className="font-medium">{profile.department}</span>
                                    </div>
                                )}

                                {profile?.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="font-medium">{profile.phone}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Member since:</span>
                                    <span className="font-medium">
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Last updated:</span>
                                    <span className="font-medium">
                                        {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Profile Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Edit className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update your personal information and preferences.
                                    </CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="outline">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancel} variant="outline" size="sm">
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} size="sm">
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    {isEditing ? (
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your display name"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-2">
                                            {profile?.name || "Not set"}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm py-2">
                                            {profile?.role || "Not assigned"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Role changes must be requested through your administrator.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    {isEditing ? (
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            placeholder="Enter your department"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-2">
                                            {profile?.department || "Not set"}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    {isEditing ? (
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter your phone number"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-2">
                                            {profile?.phone || "Not set"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Note: Some information like email and role can only be changed by administrators.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
