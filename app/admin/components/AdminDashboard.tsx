'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmbyService } from '@/lib/services/emby';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  embyUserId: string;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  plan: string | null;
  paymentReceipts?: string[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [receiptsDialogOpen, setReceiptsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (userId: string, embyUserId: string, currentStatus: string) => {
    setActionLoading(userId);
    try {
      const enableAccess = currentStatus !== 'active';
      
      // Update Emby access
      await EmbyService.updateUserPolicy(embyUserId, enableAccess);
      
      // Update Firestore user status
      await updateDoc(doc(db, 'users', userId), {
        subscriptionStatus: enableAccess ? 'active' : 'inactive'
      });
      
      // Refresh the users list
      await fetchUsers();
      
      toast({
        title: "Success",
        description: `User access has been ${enableAccess ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling access:', error);
      toast({
        title: "Error",
        description: "Failed to update user access",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete.id);
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userToDelete.id,
          embyUserId: userToDelete.embyUserId 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      // Update local state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user"
      });
    } finally {
      setActionLoading(null);
      setUserToDelete(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewReceipts = (user: User) => {
    setSelectedUser(user);
    setReceiptsDialogOpen(true);
  };

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
        <Table>
          <TableHeader>
            <TableRow>
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
                    onClick={() => handleViewReceipts(user)}
                    disabled={!user.paymentReceipts?.length}
                  >
                    View Receipts ({user.paymentReceipts?.length || 0})
                  </Button>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant={user.subscriptionStatus === 'active' ? 'destructive' : 'default'}
                    onClick={() => handleToggleAccess(user.id, user.embyUserId, user.subscriptionStatus)}
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
                    onClick={() => handleDeleteUser(user)}
                    disabled={!!actionLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the user {userToDelete?.email} from both Firebase and Emby.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={!!actionLoading}
            >
              {actionLoading === userToDelete?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={receiptsDialogOpen} onOpenChange={(open) => {
        setReceiptsDialogOpen(open);
        if (!open) setSelectedUser(null);
      }}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Receipts - {selectedUser?.email}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {selectedUser?.paymentReceipts?.map((receipt, index) => (
                <div key={index} className="border rounded p-4">
                  <a 
                    href={receipt} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Receipt #{index + 1} - View/Download
                  </a>
                </div>
              ))}
              {(!selectedUser?.paymentReceipts || selectedUser.paymentReceipts.length === 0) && (
                <p>No receipts uploaded</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 