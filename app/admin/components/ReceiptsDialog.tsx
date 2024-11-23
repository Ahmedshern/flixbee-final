"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Calendar, Clock } from "lucide-react";
import { User, Receipt } from "@/types/admin";
import { useState } from "react";
import { format } from "date-fns";

interface ReceiptsDialogProps {
  user: User | null;
  onClose: () => void;
}

export function ReceiptsDialog({ user, onClose }: ReceiptsDialogProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleDownload = async (receipt: Receipt) => {
    try {
      const response = await fetch(receipt.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${format(new Date(receipt.date), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  // Group receipts by month
  const groupedReceipts = user?.paymentReceipts?.reduce((groups, receipt) => {
    const month = format(new Date(receipt.date), 'MMMM yyyy');
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(receipt);
    return groups;
  }, {} as Record<string, Receipt[]>) || {};

  return (
    <AlertDialog open={!!user} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Payment Receipts - {user?.email}</AlertDialogTitle>
          <AlertDialogDescription>
            {Object.keys(groupedReceipts).length > 0 ? (
              <div className="space-y-6 mt-4">
                {Object.entries(groupedReceipts).map(([month, receipts]) => (
                  <div key={month} className="space-y-2">
                    <h3 className="font-semibold text-lg">{month}</h3>
                    <div className="space-y-2">
                      {receipts.map((receipt) => (
                        <div 
                          key={receipt.id} 
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {format(new Date(receipt.date), 'dd MMM yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Uploaded: {format(new Date(receipt.uploadDate), 'dd MMM yyyy HH:mm')}
                                </span>
                              </div>
                            </div>
                            {receipt.amount && (
                              <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                                Amount: {receipt.amount}
                              </span>
                            )}
                            {receipt.planName && (
                              <span className="text-sm text-muted-foreground">
                                Plan: {receipt.planName}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(receipt.url, '_blank')}
                              className="flex items-center space-x-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>View</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(receipt)}
                              className="flex items-center space-x-2"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No receipts available for this user
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 