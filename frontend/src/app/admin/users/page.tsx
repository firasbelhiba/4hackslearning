'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Edit, Trash2, MoreVertical, Shield, User, BookOpen } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock users data
const users = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'STUDENT',
    enrolledCourses: 3,
    certificates: 1,
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'STUDENT',
    enrolledCourses: 2,
    certificates: 0,
    isActive: true,
    createdAt: '2024-01-12',
  },
  {
    id: '3',
    name: 'Dhaker',
    email: 'instructor@4hacks.com',
    role: 'INSTRUCTOR',
    enrolledCourses: 0,
    certificates: 0,
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: '4hacks Admin',
    email: 'admin@4hacks.com',
    role: 'ADMIN',
    enrolledCourses: 0,
    certificates: 0,
    isActive: true,
    createdAt: '2024-01-01',
  },
];

function getRoleBadge(role: string) {
  switch (role) {
    case 'ADMIN':
      return <Badge className="bg-purple-500 text-white">Admin</Badge>;
    case 'INSTRUCTOR':
      return <Badge className="bg-brand text-black">Instructor</Badge>;
    default:
      return <Badge variant="outline">Student</Badge>;
  }
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display">Users</h1>
            <p className="text-gray-600">Manage platform users and roles</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border-2 border-black transition-all ${
                    roleFilter === role
                      ? 'bg-black text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {role === 'ALL' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">User</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Courses</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Certificates</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Joined</th>
                      <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="font-bold text-gray-600">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span>{user.enrolledCourses}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{user.certificates}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-brand/20 text-brand-dark'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
