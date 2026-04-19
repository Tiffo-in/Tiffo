import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ImageUpload = ({ value, onChange, context = 'misc', label = 'Upload Image', disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', context);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        onChange(res.data.url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(res.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.response?.data?.message || 'Server error uploading image');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative group w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            {!disabled && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-300 flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-neutral-400" />
          </div>
        )}

        {!disabled && (
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`flex items-center gap-2 px-4 py-2 mt-2 rounded-xl text-sm font-semibold transition-all ${
                isUploading 
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  {value ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </motion.button>
            <p className="text-xs text-neutral-500 mt-2">
              Supports JPEG, PNG, WEBP up to 5MB.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
