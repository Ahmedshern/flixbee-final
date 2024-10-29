'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateEmbyUserPolicy } from '@/lib/subscription';
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
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  embyUserId: string;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  plan: string | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
      await updateEmbyUserPolicy(embyUserId, enableAccess);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling access:', error);
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
      console.log('Attempting to delete user:', userToDelete);

      // Delete from Firebase Auth first
      const response = await fetch('/api/admin/delete-firebase-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userToDelete.id 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user from authentication');
      }

      // Check if we have a valid Emby user ID
      if (userToDelete.embyUserId) {
        // Delete from Emby if we have an Emby ID
        const embyResponse = await fetch('/api/admin/delete-emby-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            embyUserId: userToDelete.embyUserId 
          }),
        });

        if (!embyResponse.ok) {
          console.error('Failed to delete from Emby');
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userToDelete.id));
      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User has been deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
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
            <AlertDialogDescription>
              This will permanently delete the user from both Firebase and Emby.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {actionLoading === userToDelete?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 