import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UserProfileForm() {
    const { profile, updateUserProfile, loading } = useAuth();
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        role: profile?.role || 'sales',
        department: profile?.department || '',
        phone: profile?.phone || '',
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            await updateUserProfile(formData);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                    Update your profile information. Changes will be saved to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="display_name">Display Name</Label>
                            <Input
                                id="display_name"
                                value={formData.display_name}
                                onChange={(e) => handleInputChange('display_name', e.target.value)}
                                placeholder="Enter your display name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter your phone number"
                                type="tel"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sales">Sales</SelectItem>
                                    <SelectItem value="procurement">Procurement</SelectItem>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="qa">Quality Assurance</SelectItem>
                                    <SelectItem value="production">Production</SelectItem>
                                    <SelectItem value="management">Management</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                placeholder="Enter your department"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({
                                name: profile?.name || '',
                                role: profile?.role || 'sales',
                                department: profile?.department || '',
                                phone: profile?.phone || '',
                            })}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Email:</strong> {profile?.user_id}</p>
                        <p><strong>Status:</strong> {profile?.status}</p>
                        <p><strong>Member since:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Last updated:</strong> {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}