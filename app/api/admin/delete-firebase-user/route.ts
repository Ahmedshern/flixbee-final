import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID provided' },
        { status: 400 }
      );
    }

    // Delete the user from Firebase Auth
    await getAuth().deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Firebase user:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete user from authentication',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 