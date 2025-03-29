import axios from 'axios';

/**
 * Sends an image file to the Flask backend to generate a 3D avatar.
 * 
 * @param {File} file - The image file selected by the user
 * @param {number|string} userId - The user ID (can be dynamic)
 * @returns {Promise<string>} - Returns the avatar URL from backend
 */
export const sendToDeep3D = async (file, userId) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', userId);

    const response = await axios.post('/api/create-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.avatar_url;
  } catch (error) {
    console.error('Error sending image to Deep3D:', error);
    throw error;
  }
};
