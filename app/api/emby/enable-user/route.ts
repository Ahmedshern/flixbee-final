import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { embyUserId } = await request.json();

    if (!embyUserId) {
      return NextResponse.json(
        { error: 'No Emby user ID provided' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.EMBY_URL}/emby/Users/${embyUserId}/Policy`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': process.env.EMBY_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        IsAdministrator: false,
        IsDisabled: false,
        EnableRemoteAccess: true,
        EnablePlayback: true,
        EnableMediaPlayback: true,
        EnableAudioPlayback: true,
        EnableVideoPlayback: true,
        EnableLiveTvAccess: true,
        EnableContentDeletion: false,
        EnableContentDownloading: true,
        EnableSyncTranscoding: true,
        EnableMediaConversion: true,
        EnableSharedDeviceControl: false,
        EnableRemoteControlOfOtherUsers: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Emby server error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enabling Emby user:', error);
    return NextResponse.json(
      { error: 'Failed to enable Emby user' },
      { status: 500 }
    );
  }
} 