import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file objects
 * @param {string} folder - Folder path in Cloudinary
 * @returns {Promise<Array>} - Array of uploaded file URLs
 */
export const uploadFiles = async (files, folder = 'tshirt-store/products') => {
  try {
    const uploadPromises = files.map(file => 
      cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    }));
  } catch (error) {
    console.error('Error uploading files to Cloudinary:', error);
    throw new Error('Failed to upload files');
  }
};

/**
 * Delete files from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @returns {Promise<Object>} - Result of the delete operation
 */
export const deleteFiles = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) return { result: 'no files to delete' };
    
    const result = await cloudinary.api.delete_resources(publicIds, {
      type: 'upload',
      resource_type: 'image'
    });
    
    return result;
  } catch (error) {
    console.error('Error deleting files from Cloudinary:', error);
    throw new Error('Failed to delete files');
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Extract the public ID from the URL
  const matches = url.match(/upload\/.*\/([^/]+)\.(jpg|jpeg|png|gif|webp)/i);
  if (matches && matches[1]) {
    // Split by '/' and get the last part
    const parts = matches[1].split('/');
    return parts[parts.length - 1];
  }
  return null;
};

/**
 * Upload a base64 image to Cloudinary
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder path in Cloudinary
 * @param {object} options - Additional upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadBase64Image = async (base64Image, folder = 'tshirt-store/designs', options = {}) => {
  try {
    // Remove the data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/(png|jpe?g|webp);base64,/, '');
    
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`, 
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        ...options
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error uploading base64 image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

export default cloudinary;
