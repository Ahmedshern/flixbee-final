import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!process.env.EMBY_URL || !process.env.EMBY_API_KEY) {
      console.error('Missing Emby configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create disabled user with full email as username
    const createUserResponse = await fetch(`${process.env.EMBY_URL}/emby/Users/New`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': process.env.EMBY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: email,
        Password: password,
        EnableUserPreferenceAccess: false,
        IsDisabled: true
      }),
    });

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text();
      console.error('Emby API error:', {
        status: createUserResponse.status,
        statusText: createUserResponse.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: 'Failed to create Emby user', details: errorText },
        { status: createUserResponse.status }
      );
    }

    const userData = await createUserResponse.json();

    // Set additional policy restrictions
    const policyResponse = await fetch(`${process.env.EMBY_URL}/emby/Users/${userData.Id}/Policy`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': process.env.EMBY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        IsAdministrator: false,
        IsDisabled: true,
        EnableRemoteAccess: false,
        EnablePlayback: false,
        EnableMediaPlayback: false,
        EnableAudioPlayback: false,
        EnableVideoPlayback: false,
        EnableLiveTvAccess: false,
        EnableContentDeletion: false,
        EnableContentDownloading: false,
        EnableSyncTranscoding: false,
        EnableMediaConversion: false,
        EnableSharedDeviceControl: false,
        EnableRemoteControlOfOtherUsers: false,
        EnableFeatures: [],
        BlockedTags: [],
        IsTagBlockingModeInclusive: true
      }),
    });

    if (!policyResponse.ok) {
      await fetch(`${process.env.EMBY_URL}/emby/Users/${userData.Id}`, {
        method: 'DELETE',
        headers: {
          'X-Emby-Token': process.env.EMBY_API_KEY,
        },
      });
      
      throw new Error('Failed to set user policy');
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Error in Emby user creation:', error);
    return NextResponse.json(
      { error: 'Failed to create streaming account', details: error.message },
      { status: 500 }
    );
  }
} 