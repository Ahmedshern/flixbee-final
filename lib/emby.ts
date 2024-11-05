const EMBY_SERVER_URL = process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.EMBY_API_KEY;

interface EmbyUser {
  Name: string;
  Id: string;
}

export async function createEmbyUser(email: string, password: string) {
  try {
    const response = await fetch('/api/emby/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to create streaming account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Emby user:', error);
    throw error;
  }
}

export async function updateEmbyUserPassword(userId: string, newPassword: string) {
  try {
    const response = await fetch(`${EMBY_SERVER_URL}/Users/${userId}/Password`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': EMBY_API_KEY ?? '',
        'Content-Type': 'application/json',
      } as HeadersInit,
      body: JSON.stringify({
        NewPw: newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update Emby user password');
    }

    return true;
  } catch (error) {
    console.error('Error updating Emby user password:', error);
    throw error;
  }
}

export async function getEmbyUser(username: string): Promise<EmbyUser | null> {
  try {
    const response = await fetch(`${EMBY_SERVER_URL}/Users?api_key=${EMBY_API_KEY ?? ''}`, {
      headers: {
        'Content-Type': 'application/json',
      } as HeadersInit,
    });
    const users = await response.json();
    return users.find((user: EmbyUser) => user.Name === username) || null;
  } catch (error) {
    console.error('Error getting Emby user:', error);
    throw error;
  }
}

export async function updateEmbyUserPolicy(userId: string, isEnabled: boolean) {
  try {
    const response = await fetch(`${EMBY_SERVER_URL}/Users/${userId}/Policy`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': EMBY_API_KEY ?? '',
        'Content-Type': 'application/json',
      } as HeadersInit,
      body: JSON.stringify({
        IsDisabled: !isEnabled,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update Emby user policy');
    }

    return true;
  } catch (error) {
    console.error('Error updating Emby user policy:', error);
    throw error;
  }
}