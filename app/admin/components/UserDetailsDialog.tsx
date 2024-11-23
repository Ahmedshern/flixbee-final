"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types/admin";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

interface UserDetailsDialogProps {
  user: User | null;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  uniquePlans: string[];
}

export function UserDetailsDialog({
  user,
  onClose,
  onUpdate,
  uniquePlans,
}: UserDetailsDialogProps) {
  const handleUpdateUserDetails = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.id), updatedData);
      await onUpdate();
      toast({
        title: "Success",
        description: "User details updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user details",
      });
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Emby User ID</label>
                <p className="mt-1">{user.embyUserId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Plan</label>
                <Select
                  value={user.plan || ''}
                  onValueChange={(value) => handleUpdateUserDetails({ plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniquePlans.map(plan => plan && (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subscription End</label>
                <Input
                  type="date"
                  value={user.subscriptionEnd?.split('T')[0] || ''}
                  onChange={(e) => handleUpdateUserDetails({ 
                    subscriptionEnd: new Date(e.target.value).toISOString() 
                  })}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 