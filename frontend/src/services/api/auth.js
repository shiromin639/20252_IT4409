import apiClient from './client';

export const authApi = {
  /**
   * Logs a user in using OAuth2 Form Data format.
   * @param {Object} credentials - The login credentials
   * @param {string} credentials.username - The user's username or email
   * @param {string} credentials.password - The user's password
   */
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    // Call login-access token
    const tokenData = await apiClient.post('/login/access-token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Save tokens to use in subsequent requests
    localStorage.setItem('token', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }

    // Fetch user profile immediately after login
    const userProfile = await apiClient.get('/profile');

    return {
      user: userProfile,
      token: tokenData.access_token,
    };
  },

  /**
   * Registers a new user.
   */
  register: async (data) => {
    const response = await apiClient.post('/users/register', data);
    return response;
  },

  /**
   * Gets the current user's profile.
   */
  getProfile: async () => {
    return apiClient.get('/profile');
  },
};
