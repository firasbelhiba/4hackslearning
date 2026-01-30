'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { organizationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Users,
  UserPlus,
  Trash2,
  Shield,
  User,
  Crown,
} from 'lucide-react';

interface Member {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  joinedAt: string;
}

interface Organization {
  id: string;
  name: string;
  members: Member[];
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-yellow-400 text-black border-black',
  ADMIN: 'bg-blue-400 text-black border-black',
  MEMBER: 'bg-gray-200 text-black border-black',
};

const roleIcons: Record<string, React.ReactNode> = {
  OWNER: <Crown className="h-3.5 w-3.5" />,
  ADMIN: <Shield className="h-3.5 w-3.5" />,
  MEMBER: <User className="h-3.5 w-3.5" />,
};

export default function MembersPage() {
  const { currentOrganization, user } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add member modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isAdding, setIsAdding] = useState(false);

  // Remove member modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, [currentOrganization]);

  const fetchOrganization = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await organizationsApi.getById(currentOrganization.id);
      setOrganization(response.data);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!currentOrganization || !newMemberEmail) return;

    try {
      setIsAdding(true);
      await organizationsApi.addMember(currentOrganization.id, {
        userId: newMemberEmail, // The backend should handle email lookup
        role: newMemberRole,
      });
      toast({ title: 'Member invited', variant: 'success' });
      fetchOrganization();
      setAddModalOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('MEMBER');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add member',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!currentOrganization) return;

    try {
      await organizationsApi.updateMemberRole(currentOrganization.id, memberId, newRole);
      toast({ title: 'Role updated', variant: 'success' });
      fetchOrganization();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!currentOrganization || !memberToRemove) return;

    try {
      await organizationsApi.removeMember(currentOrganization.id, memberToRemove.id);
      toast({ title: 'Member removed', variant: 'success' });
      fetchOrganization();
      setRemoveModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const isCurrentUserOwner = organization?.members?.some(
    (m) => m.user.id === user?.id && m.role === 'OWNER'
  );

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization from the sidebar.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Team Members</h1>
          <p className="text-gray-600 mt-1">
            Manage who has access to your organization.
          </p>
        </div>
        {isCurrentUserOwner && (
          <Button
            onClick={() => setAddModalOpen(true)}
            variant="primary"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-black flex items-center gap-2">
            <div className="p-2 bg-brand rounded-lg border-2 border-black">
              <Users className="h-5 w-5 text-black" />
            </div>
            Members ({organization?.members?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !organization?.members || organization.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No members yet</h3>
              <p className="text-gray-600 text-center">
                Add team members to collaborate on your courses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {organization.members
                .sort((a, b) => {
                  const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
                  return roleOrder[a.role] - roleOrder[b.role];
                })
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-black bg-gray-50 shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg border-2 border-black bg-brand flex items-center justify-center">
                        <span className="text-sm font-bold text-black">
                          {member.user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-black">{member.user.name}</h3>
                          {member.user.id === user?.id && (
                            <span className="text-xs font-medium text-gray-500">(You)</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCurrentUserOwner && member.role !== 'OWNER' ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleUpdateRole(member.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              Admin
                            </SelectItem>
                            <SelectItem value="MEMBER">
                              Member
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={roleColors[member.role]}>
                          <span className="flex items-center gap-1">
                            {roleIcons[member.role]}
                            {member.role}
                          </span>
                        </Badge>
                      )}

                      {isCurrentUserOwner && member.role !== 'OWNER' && (
                        <button
                          onClick={() => {
                            setMemberToRemove(member);
                            setRemoveModalOpen(true);
                          }}
                          className="p-2 rounded border-2 border-transparent hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-black">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border-2 border-black bg-yellow-50 shadow-brutal-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-yellow-400 rounded-lg border-2 border-black">
                  <Crown className="h-4 w-4 text-black" />
                </div>
                <span className="font-bold text-black">Owner</span>
              </div>
              <p className="text-sm text-gray-600">
                Full access including billing, member management, and organization settings.
              </p>
            </div>
            <div className="p-4 rounded-lg border-2 border-black bg-blue-50 shadow-brutal-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-400 rounded-lg border-2 border-black">
                  <Shield className="h-4 w-4 text-black" />
                </div>
                <span className="font-bold text-black">Admin</span>
              </div>
              <p className="text-sm text-gray-600">
                Can manage courses, templates, and content. Cannot manage billing or members.
              </p>
            </div>
            <div className="p-4 rounded-lg border-2 border-black bg-gray-50 shadow-brutal-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gray-300 rounded-lg border-2 border-black">
                  <User className="h-4 w-4 text-black" />
                </div>
                <span className="font-bold text-black">Member</span>
              </div>
              <p className="text-sm text-gray-600">
                Can view and edit assigned courses. Limited access to organization features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite someone to join your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email or User ID</Label>
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newMemberRole}
                onValueChange={(value: 'ADMIN' | 'MEMBER') => setNewMemberRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    Admin
                  </SelectItem>
                  <SelectItem value="MEMBER">
                    Member
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              variant="primary"
              disabled={isAdding || !newMemberEmail}
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name} from the organization?
              They will lose access to all organization resources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
