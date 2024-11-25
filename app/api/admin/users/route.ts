import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const adminLoggedIn = (await cookieStore).get('adminLoggedIn')?.value;
    
    if (!adminLoggedIn || adminLoggedIn !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch users from Firestore using admin SDK
    const usersSnapshot = await adminDb.collection('users').get();
    const usersData = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        
        // Fetch receipts collection for each user
        const receiptsSnapshot = await adminDb
          .collection('users')
          .doc(doc.id)
          .collection('receipts')
          .get();

        const receipts = receiptsSnapshot.docs.map(receiptDoc => {
          const receiptData = receiptDoc.data();
          return {
            id: receiptDoc.id,
            url: receiptData.url,
            date: receiptData.date,
            amount: receiptData.amount,
            planName: receiptData.planName,
            uploadDate: receiptData.uploadDate || receiptData.date
          };
        });

        // Sort receipts by date, newest first
        receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          id: doc.id,
          ...userData,
          paymentReceipts: receipts,
        };
      })
    );

    return NextResponse.json({ users: usersData });
  } catch (error: any) {
    console.error('Error in users route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 