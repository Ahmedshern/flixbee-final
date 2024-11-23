"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const notificationTypes = [
  'subscription_activated',
  'subscription_expiring_soon',
  'subscription_expired',
  'payment_received',
  'payment_failed'
] as const;

export function NotificationTester() {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState<typeof notificationTypes[number]>('subscription_activated');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          data: {
            duration: 1,
            plan: 'basic',
            amount: 10,
            daysLeft: 3
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      toast({
        title: 'Success',
        description: 'Notification sent successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Test Notifications</h3>
      <div className="space-y-2">
        <Input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <Select
          value={type}
          onValueChange={(value) => setType(value as typeof type)}
        >
          {notificationTypes.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Button 
          onClick={handleTest} 
          disabled={loading || !userId}
        >
          {loading ? 'Sending...' : 'Test Notification'}
        </Button>
      </div>
    </div>
  );
}
