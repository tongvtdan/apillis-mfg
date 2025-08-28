import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Lock,
  Unlock,
  MoreVertical,
  Shield,
  Calendar,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/contexts/AuthContext';
import { ROLE_DESCRIPTIONS } from '@/lib/auth-constants';

interface UserWithStats extends UserProfile {
  login_attempts?: number;
  locked_until?: string;
  password_last_changed?: string;
}

export default function AdminUsers() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Compute access but do not return before hooks to keep hook order stable
  const canAccess = profile?.role === 'management' || profile?.role === 'admin';

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch users from the users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users."
        });
        return;
      }

      setUsers((usersData || []) as UserWithStats[]);
      setFilteredUsers((usersData || []) as UserWithStats[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Log the role change
      await supabase.from('activity_log').insert({
        action: 'role_change',
        user_id: profile?.id,
        organization_id: profile?.organization_id,
        entity_type: 'user',
        entity_id: userId,
        old_values: { role: users.find(u => u.id === userId)?.role },
        new_values: { role: newRole }
      });

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated."
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role."
      });
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If unlocking, clear lockout fields
      if (newStatus === 'active') {
        updateData.locked_until = null;
        updateData.login_attempts = 0;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Log the status change
      await supabase.from('activity_log').insert({
        action: newStatus === 'active' ? 'account_unlocked' : 'account_locked',
        user_id: profile?.id,
        organization_id: profile?.organization_id,
        entity_type: 'user',
        entity_id: userId,
        old_values: { status: users.find(u => u.id === userId)?.status },
        new_values: { status: newStatus }
      });

      toast({
        title: "Status Updated",
        description: `User account has been ${newStatus.toLowerCase()}.`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status."
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'locked': return 'destructive';
      case 'pending': return 'outline';
      case 'dormant': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'management': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'procurement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'engineering': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'qa': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'production': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'supplier': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'customer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const isAccountLocked = (user: UserWithStats) => {
    if (!user.locked_until) return false;
    return new Date(user.locked_until) > new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  useEffect(() => {
    if (canAccess) {
      fetchUsers();
    }
  }, [canAccess]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users]);

  const roles = ['customer', 'procurement', 'engineering', 'qa', 'production', 'supplier', 'management'];
  const statuses = ['active', 'dismiss'];

  return (
    <div className="space-y-6 p-6 bg-base-100 text-base-content min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-base-content">
            <Users className="h-8 w-8 text-base-content" />
            User Management
          </h1>
          <p className="text-base-content/70">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <Button
          variant="accent"
          className="action-button shadow-md hover:shadow-lg"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Total Users</p>
                <p className="text-2xl font-bold text-base-content">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-base-content/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Locked Accounts</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => isAccountLocked(u)).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70">Dismissed Users</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'dismiss').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-base-content/70" />
              <Input
                placeholder="Search users by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-base-content/70">
                            {user.email || 'No email'}
                          </div>
                          {user.login_attempts > 0 && (
                            <div className="text-xs text-red-600">
                              {user.login_attempts} failed attempts
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {isAccountLocked(user) ? 'Locked' : user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{formatDate(user.last_login_at)}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setEditDialogOpen(open);
                            if (open) setSelectedUser(user);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="modal-dialog">
                              <DialogHeader className="modal-dialog-header">
                                <DialogTitle className="modal-dialog-title">Edit User: {user.name}</DialogTitle>
                                <DialogDescription className="modal-dialog-description">
                                  Update user role and status
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="role">Role</Label>
                                  <Select
                                    value={selectedUser?.role}
                                    onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, role: value as any } : null)}
                                  >
                                    <SelectTrigger className="modal-select-trigger">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles.map(role => (
                                        <SelectItem key={role} value={role}>
                                          {role}
                                          <div className="text-xs text-base-content/70 ml-2">
                                            {ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select
                                    value={selectedUser?.status}
                                    onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, status: value as any } : null)}
                                  >
                                    <SelectTrigger className="modal-select-trigger">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statuses.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button variant="outline" className="border-2 modal-button-secondary" onClick={() => setEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button variant="accent" className="modal-button-primary" onClick={() => {
                                  if (selectedUser) {
                                    if (selectedUser.role !== user.role) {
                                      updateUserRole(user.id, selectedUser.role);
                                    }
                                    if (selectedUser.status !== user.status) {
                                      updateUserStatus(user.id, selectedUser.status);
                                    }
                                  }
                                  setEditDialogOpen(false);
                                }}>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {isAccountLocked(user) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateUserStatus(user.id, 'active')}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateUserStatus(user.id, 'locked')}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}