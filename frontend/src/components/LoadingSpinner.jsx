import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/lottie/loading-food.json';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizes = {
    small: { width: 80, height: 80 },
    medium: { width: 150, height: 150 },
    large: { width: 200, height: 200 }
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Lottie Animation */}
      <div style={sizes[size]}>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Loading Text */}
      {message && (
        <motion.p
          className={`mt-4 text-gray-600 font-medium ${textSizes[size]}`}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      )}

      {/* Loading Dots */}
      <div className="flex space-x-2 mt-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-maroon-500 rounded-full"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
