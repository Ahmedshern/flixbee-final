import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { embyUserId } = await request.json();
    
    console.log('Starting delete process for Emby user:', embyUserId);

    if (!embyUserId) {
      return NextResponse.json(
        { error: 'No Emby user ID provided' },
        { status: 400 }
      );
    }

    if (!process.env.EMBY_SERVER_URL || !process.env.EMBY_API_KEY) {
      console.error('Missing Emby configuration');
      return NextResponse.json(
        { error: 'Emby configuration missing' },
        { status: 500 }
      );
    }

    const url = `${process.env.EMBY_SERVER_URL}/Users/${embyUserId}`;
    console.log('Making DELETE request to:', url);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Emby-Token': process.env.EMBY_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ success: true, warning: 'User not found in Emby' });
        }
        throw new Error(`Emby API error: ${responseText}`);
      }

      return NextResponse.json({ success: true });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in delete-emby-user route:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete user from Emby',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 