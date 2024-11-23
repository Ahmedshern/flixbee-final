const EMBY_URL = process.env.NEXT_PUBLIC_EMBY_URL || process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.NEXT_PUBLIC_EMBY_API_KEY || process.env.EMBY_API_KEY;

interface EmbyUser {
  Name: string;
  Id: string;
  Policy?: {
    IsDisabled: boolean;
  };
}

class EmbyError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'EmbyError';
  }
}

export class EmbyService {
  private static async fetchEmby(endpoint: string, options: RequestInit = {}) {
    if (!EMBY_URL || !EMBY_API_KEY) {
      throw new Error('Missing Emby configuration. Please check NEXT_PUBLIC_EMBY_URL and NEXT_PUBLIC_EMBY_API_KEY environment variables.');
    }

    const url = `${EMBY_URL}/emby${endpoint}`;
    const headers = {
      'X-Emby-Token': EMBY_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new EmbyError(`Emby API error (${response.status}): ${errorText}`, response.status);
      }
      
      return response;
    } catch (error: any) {
      console.error('Emby service error:', error);
      throw error;
    }
  }

  static async createUser(email: string, password: string): Promise<EmbyUser> {
    try {
      // 1. Create the user first
      const createResponse = await this.fetchEmby('/Users/New', {
        method: 'POST',
        body: JSON.stringify({
          Name: email,
        })
      });
      
      const userData = await createResponse.json();
      
      if (!userData || !userData.Id) {
        throw new Error('Invalid response from Emby server');
      }

      // 2. Set the password
      await this.fetchEmby(`/Users/${userData.Id}/Password`, {
        method: 'POST',
        body: JSON.stringify({
          NewPw: password
        })
      });

      // 3. Set the user policy
      await this.fetchEmby(`/Users/${userData.Id}/Policy`, {
        method: 'POST',
        body: JSON.stringify({
          IsAdministrator: false,
          IsHidden: false,
          IsDisabled: true,
          EnableUserPreferenceAccess: true,
          EnableRemoteAccess: true,
          EnableLiveTvAccess: true,
          EnableMediaPlayback: true,
          EnableAudioPlaybackTranscoding: true,
          EnableVideoPlaybackTranscoding: true,
          EnablePlaybackRemuxing: true,
          EnableContentDeletion: false,
          EnableContentDownloading: true,
          EnableSyncTranscoding: true,
          EnableSubtitleDownloading: true,
          EnableSubtitleManagement: true,
          EnablePublicSharing: false,
          RemoteClientBitrateLimit: 0,
          AuthenticationProviderId: "Default",
          EnableAllDevices: true,
          EnableAllChannels: true,
          EnableAllFolders: true,
          SimultaneousStreamLimit: 3
        })
      });

      // 4. Set user configuration
      await this.fetchEmby(`/Users/${userData.Id}/Configuration`, {
        method: 'POST',
        body: JSON.stringify({
          AudioLanguagePreference: "eng",
          PlayDefaultAudioTrack: true,
          SubtitleLanguagePreference: "eng",
          DisplayMissingEpisodes: false,
          SubtitleMode: "Default",
          EnableLocalPassword: true,
          OrderedViews: [],
          LatestItemsExcludes: [],
          MyMediaExcludes: [],
          HidePlayedInLatest: true,
          RememberAudioSelections: true,
          RememberSubtitleSelections: true,
          EnableNextEpisodeAutoPlay: true
        })
      });

      return userData;
    } catch (error: any) {
      console.error('Error creating Emby user:', error);
      throw error;
    }
  }

  static async getUserStatus(userId: string): Promise<boolean> {
    try {
      const response = await this.fetchEmby(`/Users/${userId}`);
      const userData = await response.json();
      return !userData.Policy?.IsDisabled;
    } catch (error) {
      console.error('Error getting user status:', error);
      throw new EmbyError('Failed to get user status');
    }
  }

  static async updateUserPolicy(
    userId: string, 
    isEnabled: boolean, 
    deviceLimit: number = 2,
    maxStreamingBitrate: number = 1080000000 // Default to 1080p
  ) {
    await this.fetchEmby(`/Users/${userId}/Policy`, {
      method: 'POST',
      body: JSON.stringify({
        IsAdministrator: false,
        IsDisabled: !isEnabled,
        EnableRemoteAccess: isEnabled,
        EnableMediaPlayback: isEnabled,
        EnableAudioPlaybackTranscoding: isEnabled,
        EnableVideoPlaybackTranscoding: isEnabled,
        EnablePlaybackRemuxing: isEnabled,
        EnableContentDownloading: isEnabled,
        EnableSyncTranscoding: isEnabled,
        EnableSubtitleDownloading: isEnabled,
        EnableSubtitleManagement: isEnabled,
        EnablePublicSharing: false,
        EnableAllDevices: isEnabled,
        EnableAllChannels: isEnabled,
        EnableAllFolders: isEnabled,
        SimultaneousStreamLimit: isEnabled ? deviceLimit : 0,
        RemoteClientBitrateLimit: maxStreamingBitrate,
        MaxStreamingBitrate: maxStreamingBitrate,
        MaxStaticBitrate: maxStreamingBitrate,
        MaxStaticRemoteQuality: maxStreamingBitrate,
        // Quality settings
        QualityOptions: {
          MaxStreamingBitrate: maxStreamingBitrate,
          MaxStaticBitrate: maxStreamingBitrate,
          MaxStaticRemoteQuality: maxStreamingBitrate,
          EnableAudioPlaybackTranscoding: true,
          EnableVideoPlaybackTranscoding: true,
          EnablePlaybackRemuxing: true
        }
      })
    });
  }

  static async deleteUser(userId: string) {
    await this.fetchEmby(`/Users/${userId}`, {
      method: 'DELETE'
    });
  }

  static async updatePassword(userId: string, newPassword: string) {
    await this.fetchEmby(`/Users/${userId}/Password`, {
      method: 'POST',
      body: JSON.stringify({
        NewPw: newPassword
      })
    });
  }
} 