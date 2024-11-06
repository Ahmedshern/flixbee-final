"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth-provider";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  plan: string;
  status: string;
  duration: number;
}

export default function BillingPage() {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const transactionData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionData.push({
            id: doc.id,
            amount: data.amount,
            date: data.date,
            plan: data.plan,
            status: data.status,
            duration: data.duration
          });
        });

        setTransactions(transactionData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your payment history and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), "PPP")}
                    </TableCell>
                    <TableCell className="capitalize">{transaction.plan}</TableCell>
                    <TableCell>{transaction.duration} months</TableCell>
                    <TableCell>MVR {transaction.amount}</TableCell>
                    <TableCell className="capitalize">{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No billing history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}