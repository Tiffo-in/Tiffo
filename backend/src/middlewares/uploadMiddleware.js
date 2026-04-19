const multer = require('multer');
const path = require('path');

// Use memory storage so we can buffer the image and stream directly to Cloudinary without writing to local disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only certain image file types
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WEBP file types are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

module.exports = upload;
