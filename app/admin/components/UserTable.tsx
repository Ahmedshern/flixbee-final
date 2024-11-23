"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { User } from '@/types/admin';

interface UserTableProps {
  users: User[];
  selectedUsers: Set<string>;
  onSelectUser: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleAccess: (userId: string, embyUserId: string, currentStatus: string) => Promise<void>;
  onDeleteUser: (user: User) => void;
  onViewReceipts: (user: User) => void;
  onViewDetails: (user: User) => void;
  actionLoading: string | null;
}

export function UserTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onToggleAccess,
  onDeleteUser,
  onViewReceipts,
  onViewDetails,
  actionLoading,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <input
              type="checkbox"
              checked={selectedUsers.size === users.length}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Subscription Status</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Subscription End</TableHead>
          <TableHead>Receipts</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <input
                type="checkbox"
                checked={selectedUsers.has(user.id)}
                onChange={(e) => onSelectUser(user.id, e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.subscriptionStatus}</TableCell>
            <TableCell>{user.plan || 'N/A'}</TableCell>
            <TableCell>
              {user.subscriptionEnd 
                ? new Date(user.subscriptionEnd).toLocaleDateString()
                : 'N/A'}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReceipts(user)}
                disabled={!user.paymentReceipts?.length}
                className="flex items-center space-x-2"
              >
                <span>Receipts</span>
                {user.paymentReceipts?.length ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {user.paymentReceipts.length}
                  </span>
                ) : null}
              </Button>
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant={user.subscriptionStatus === 'active' ? 'destructive' : 'default'}
                onClick={() => onToggleAccess(user.id, user.embyUserId, user.subscriptionStatus)}
                disabled={!!actionLoading}
                className="mr-2"
              >
                {actionLoading === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  user.subscriptionStatus === 'active' ? 'Disable Access' : 'Enable Access'
                )}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDeleteUser(user)}
                disabled={!!actionLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 