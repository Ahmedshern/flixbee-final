'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { User } from '@/types/admin';
import {
  UserTable,
  UserFilters,
  UserDetailsDialog,
  ReceiptsDialog,
  DeleteConfirmDialog,
} from './index';

export default function AdminDashboard() {
  const { users, loading, actionLoading, fetchUsers, toggleAccess, deleteUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Get unique plans for filter dropdown
  const uniquePlans = Array.from(
    new Set(
      users
        .map(user => user.plan)
        .filter((plan): plan is string => Boolean(plan))
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          planFilter={planFilter}
          onPlanFilterChange={setPlanFilter}
          uniquePlans={uniquePlans}
        />

        <UserTable
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectUser={(userId, checked) => {
            const newSelected = new Set(selectedUsers);
            if (checked) {
              newSelected.add(userId);
            } else {
              newSelected.delete(userId);
            }
            setSelectedUsers(newSelected);
          }}
          onSelectAll={(checked) => {
            if (checked) {
              setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
            } else {
              setSelectedUsers(new Set());
            }
          }}
          onToggleAccess={toggleAccess}
          onDeleteUser={setUserToDelete}
          onViewReceipts={setSelectedUser}
          onViewDetails={setSelectedUserDetails}
          actionLoading={actionLoading}
        />
      </div>

      <DeleteConfirmDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={async () => {
          if (!userToDelete) return;
          
          try {
            await deleteUser(userToDelete.id, userToDelete.embyUserId);
            setUserToDelete(null);
          } catch (error) {
            // Error is already handled in useUsers hook
            setUserToDelete(null);
          }
        }}
        loading={!!actionLoading}
      />

      <ReceiptsDialog
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <UserDetailsDialog
        user={selectedUserDetails}
        onClose={() => setSelectedUserDetails(null)}
        onUpdate={fetchUsers}
        uniquePlans={uniquePlans}
      />
    </>
  );
} 