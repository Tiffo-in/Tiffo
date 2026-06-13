const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadBufferToCloudinary } = require('../config/cloudinary');
const { protect } = require('../middlewares/auth');

/**
 * @route   POST /api/upload
 * @desc    Upload an image to Cloudinary
 * @access  Private
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Determine folder based on request context if provided, default to 'tiffo/misc'
    let folder = 'tiffo/misc';
    if (req.body.context === 'avatar') folder = 'tiffo/avatars';
    if (req.body.context === 'tiffin') folder = 'tiffo/tiffins';
    if (req.body.context === 'logo') folder = 'tiffo/logos';

    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while uploading image',
    });
  }
});

module.exports = router;
