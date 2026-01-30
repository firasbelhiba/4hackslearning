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
  OWNER: 'bg-yellow-500/20 text-yellow-400',
  ADMIN: 'bg-blue-500/20 text-blue-400',
  MEMBER: 'bg-zinc-500/20 text-zinc-400',
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
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Organization Selected</h2>
          <p className="text-zinc-400">Please select an organization from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-zinc-400 mt-1">
            Manage who has access to your organization.
          </p>
        </div>
        {isCurrentUserOwner && (
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#D6FF25]" />
            Members ({organization?.members?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/50 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-zinc-700"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-zinc-700 rounded w-48"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !organization?.members || organization.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No members yet</h3>
              <p className="text-zinc-400 text-center">
                Add team members to collaborate on your courses.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {organization.members
                .sort((a, b) => {
                  const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
                  return roleOrder[a.role] - roleOrder[b.role];
                })
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#D6FF25]/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-[#D6FF25]">
                          {member.user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{member.user.name}</h3>
                          {member.user.id === user?.id && (
                            <span className="text-xs text-zinc-500">(You)</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCurrentUserOwner && member.role !== 'OWNER' ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleUpdateRole(member.id, value)}
                        >
                          <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="ADMIN" className="text-white focus:bg-zinc-700 focus:text-white">
                              Admin
                            </SelectItem>
                            <SelectItem value="MEMBER" className="text-white focus:bg-zinc-700 focus:text-white">
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
                          className="text-zinc-500 hover:text-red-400 transition-colors p-2"
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
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span className="font-medium text-white">Owner</span>
              </div>
              <p className="text-sm text-zinc-400">
                Full access including billing, member management, and organization settings.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-white">Admin</span>
              </div>
              <p className="text-sm text-zinc-400">
                Can manage courses, templates, and content. Cannot manage billing or members.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-zinc-400" />
                <span className="font-medium text-white">Member</span>
              </div>
              <p className="text-sm text-zinc-400">
                Can view and edit assigned courses. Limited access to organization features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Add Team Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Invite someone to join your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email or User ID</Label>
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="member@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Role</Label>
              <Select
                value={newMemberRole}
                onValueChange={(value: 'ADMIN' | 'MEMBER') => setNewMemberRole(value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="ADMIN" className="text-white focus:bg-zinc-700 focus:text-white">
                    Admin
                  </SelectItem>
                  <SelectItem value="MEMBER" className="text-white focus:bg-zinc-700 focus:text-white">
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
              className="bg-zinc-800 border-zinc-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
              disabled={isAdding || !newMemberEmail}
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Modal */}
      <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remove Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to remove {memberToRemove?.user.name} from the organization?
              They will lose access to all organization resources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-white"
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
