const EMBY_SERVER_URL = process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.EMBY_API_KEY;

if (!EMBY_SERVER_URL || !EMBY_API_KEY) {
  throw new Error('EMBY_SERVER_URL and EMBY_API_KEY must be defined');
}

interface EmbyUser {
  Name: string;
  Id: string;
}

interface CreateUserResponse {
  Id: string;
  Name: string;
}

export async function createEmbyUser(username: string, password: string): Promise<CreateUserResponse> {
  try {
    const response = await fetch(`${EMBY_SERVER_URL}/Users/New`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': EMBY_API_KEY as string, // Type assertion to ensure it's a string
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: username,
        Password: password,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Emby user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Emby user:', error);
    throw error;
  }
}

// Similar changes should be made for other functions that use headers
export async function updateEmbyUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const response = await fetch(`${EMBY_SERVER_URL}/Users/${userId}/Password`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': EMBY_API_KEY as string,
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${EMBY_SERVER_URL}/Users?api_key=${EMBY_API_KEY}`);
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
        'X-Emby-Token': EMBY_API_KEY,
        'Content-Type': 'application/json',
      },
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

// Update other functions similarly...
