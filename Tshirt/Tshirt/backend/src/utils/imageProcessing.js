import { v4 as uuidv4 } from 'uuid';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

/**
 * Generates a thumbnail from a base64 image
 * @param {string} base64Image - Base64 encoded image
 * @param {object} options - Options for thumbnail generation
 * @param {number} [options.width=300] - Thumbnail width
 * @param {number} [options.height=300] - Thumbnail height
 * @param {string} [options.format='jpeg'] - Output format (jpeg, png, webp)
 * @param {number} [options.quality=0.8] - Image quality (0-1)
 * @returns {Promise<Buffer>} - Processed image buffer
 */
export const generateThumbnail = async (base64Image, options = {}) => {
  try {
    const {
      width = 300,
      height = 300,
      format = 'jpeg',
      quality = 0.8
    } = options;

    // Remove the data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/(png|jpe?g|webp);base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Load the image
    const image = await loadImage(imageBuffer);
    
    // Calculate dimensions while maintaining aspect ratio
    const aspectRatio = image.width / image.height;
    let newWidth, newHeight;
    
    if (aspectRatio > 1) {
      // Landscape
      newWidth = width;
      newHeight = width / aspectRatio;
    } else {
      // Portrait or square
      newWidth = height * aspectRatio;
      newHeight = height;
    }
    
    // Create canvas and draw the image
    const canvas = createCanvas(newWidth, newHeight);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, newWidth, newHeight);
    
    // Draw image centered
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    
    // Convert to buffer
    let outputBuffer;
    switch (format.toLowerCase()) {
      case 'png':
        outputBuffer = canvas.toBuffer('image/png', { compressionLevel: 9 });
        break;
      case 'webp':
        outputBuffer = canvas.toBuffer('image/webp', { quality: quality * 100 });
        break;
      case 'jpeg':
      default:
        outputBuffer = canvas.toBuffer('image/jpeg', { quality: quality * 100 });
    }
    
    return outputBuffer;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

/**
 * Saves an image buffer to a temporary file
 * @param {Buffer} buffer - Image buffer
 * @param {string} [extension='jpg'] - File extension
 * @returns {Promise<string>} - Path to the temporary file
 */
export const saveTempImage = async (buffer, extension = 'jpg') => {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `${uuidv4()}.${extension}`);
    await writeFileAsync(tempFilePath, buffer);
    return tempFilePath;
  } catch (error) {
    console.error('Error saving temporary image:', error);
    throw new Error('Failed to save temporary image');
  }
};

/**
 * Deletes a temporary file
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<void>}
 */
export const deleteTempFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    console.error('Error deleting temporary file:', error);
    // Don't throw error for cleanup failures
  }
};

/**
 * Converts an image to base64
 * @param {Buffer} buffer - Image buffer
 * @param {string} [mimeType='image/jpeg'] - MIME type of the image
 * @returns {string} - Base64 encoded image
 */
export const bufferToBase64 = (buffer, mimeType = 'image/jpeg') => {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};
