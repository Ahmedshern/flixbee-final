import { useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmbyService } from '@/lib/services/emby';
import { toast } from "@/hooks/use-toast";
import { User, Receipt } from '@/types/admin';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = await Promise.all(
        usersSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          
          // Fetch receipts collection for each user
          const receiptsSnapshot = await getDocs(collection(db, 'users', doc.id, 'receipts'));
          const receipts: Receipt[] = receiptsSnapshot.docs.map(receiptDoc => {
            const receiptData = receiptDoc.data();
            return {
              id: receiptDoc.id,
              url: receiptData.url,
              date: receiptData.date,
              amount: receiptData.amount,
              planName: receiptData.planName,
              uploadDate: receiptData.uploadDate || receiptData.date // fallback to date if uploadDate not available
            };
          });

          // Sort receipts by date, newest first
          receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return {
            id: doc.id,
            ...userData,
            paymentReceipts: receipts,
          } as User;
        })
      );
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAccess = useCallback(async (userId: string, embyUserId: string, currentStatus: string) => {
    setActionLoading(userId);
    try {
      const enableAccess = currentStatus !== 'active';
      
      await EmbyService.updateUserPolicy(embyUserId, enableAccess);
      await updateDoc(doc(db, 'users', userId), {
        subscriptionStatus: enableAccess ? 'active' : 'inactive'
      });
      
      await fetchUsers();
      
      toast({
        title: "Success",
        description: `User access has been ${enableAccess ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user access"
      });
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string, embyUserId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, embyUserId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setUsers(users => users.filter(user => user.id !== userId));
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
      throw error;
    } finally {
      setActionLoading(null);
    }
  }, []);

  return {
    users,
    loading,
    actionLoading,
    fetchUsers,
    toggleAccess,
    deleteUser
  };
} 