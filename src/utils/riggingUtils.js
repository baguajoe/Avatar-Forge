import axios from 'axios';

/**
 * Sends the avatar URL to a backend rigging endpoint (mocked or real).
 * Replace endpoint when real rigging API is available.
 *
 * @param {string} avatarUrl - URL of the generated 3D avatar
 * @returns {Promise<string>} - Returns rigged avatar URL (or same URL if mocked)
 */
export const applyRigToAvatar = async (avatarUrl) => {
  try {
    // Replace with real API call if needed
    const response = await axios.post('/api/rig-avatar', { avatar_url: avatarUrl });
    return response.data.rigged_avatar_url;
  } catch (error) {
    console.error('Error rigging avatar:', error);
    throw error;
  }
};
