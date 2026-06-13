const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer
 * @param {String} folder - Optional folder name inside Cloudinary
 * @returns {Promise} Resolves with Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = 'tiffo') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    // End the stream by passing the buffer
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
};
