import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LocationPicker = ({ onLocationChange, defaultRadius = 10 }) => {
    const [location, setLocation] = useState(null);
    const [radius, setRadius] = useState(defaultRadius);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

    // Get user's current location
    const getCurrentLocation = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(newLocation);
                setPermissionStatus('granted');
                setIsLoading(false);

                // Notify parent component
                if (onLocationChange) {
                    onLocationChange({ ...newLocation, radius });
                }
            },
            (err) => {
                setIsLoading(false);
                setPermissionStatus('denied');

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Location permission denied. Please enable location access in your browser settings.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Location information is unavailable.');
                        break;
                    case err.TIMEOUT:
                        setError('Location request timed out.');
                        break;
                    default:
                        setError('An unknown error occurred.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Clear location
    const clearLocation = () => {
        setLocation(null);
        setError(null);
        if (onLocationChange) {
            onLocationChange(null);
        }
    };

    // Handle radius change
    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        if (location && onLocationChange) {
            onLocationChange({ ...location, radius: newRadius });
        }
    };

    return (
        <motion.div
            className="bg-white p-4 rounded-lg shadow-sm mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">📍</span>
                    Find Nearby Tiffins
                </h3>
                {location && (
                    <motion.button
                        onClick={clearLocation}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Clear Location
                    </motion.button>
                )}
            </div>

            {/* Location Status */}
            {location ? (
                <motion.div
                    className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="flex items-center text-green-800">
                        <span className="text-xl mr-2">✅</span>
                        <div>
                            <p className="font-medium">Location Enabled</p>
                            <p className="text-sm text-green-600">
                                Showing tiffins within {radius} km of your location
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : error ? (
                <motion.div
                    className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="flex items-start text-red-800">
                        <span className="text-xl mr-2">⚠️</span>
                        <div>
                            <p className="font-medium">Location Error</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                </motion.div>
            ) : null}

            {/* Get Location Button */}
            {!location && (
                <motion.button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${isLoading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-maroon-600 hover:bg-maroon-700 text-white shadow-md hover:shadow-lg'
                        }`}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Getting your location...
                        </>
                    ) : (
                        <>
                            <span className="text-xl mr-2">📍</span>
                            Use My Current Location
                        </>
                    )}
                </motion.button>
            )}

            {/* Radius Slider */}
            {location && (
                <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Radius: <span className="text-maroon-600 font-bold">{radius} km</span>
                    </label>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">1 km</span>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={radius}
                            onChange={(e) => handleRadiusChange(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-maroon-600"
                        />
                        <span className="text-xs text-gray-500">50 km</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Nearby</span>
                        <span>Far</span>
                    </div>
                </motion.div>
            )}

            {/* Info Text */}
            {!location && !error && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                    We'll use your location to show tiffin services near you. Your location is not stored.
                </p>
            )}
        </motion.div>
    );
};

export default LocationPicker;
