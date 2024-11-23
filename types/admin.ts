export interface Receipt {
  id: string;
  url: string;
  date: string;
  uploadDate: string;
  amount?: string;
  planName?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  email: string;
  embyUserId: string;
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  plan: string | null;
  paymentReceipts?: Receipt[];
  isLoading?: boolean;
} 