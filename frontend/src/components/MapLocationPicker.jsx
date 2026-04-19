import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker for business location
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const defaultCenter = {
    lat: 28.6139, // Delhi center
    lng: 77.2090
};

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            const newPosition = {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            };
            setPosition(newPosition);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} icon={redIcon} /> : null;
}

const MapLocationPicker = ({ onLocationSelect, initialLocation = null }) => {
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
    const [mapCenter, setMapCenter] = useState(initialLocation || defaultCenter);
    const [isSearching, setIsSearching] = useState(false);
    const mapRef = useRef(null);

    // Update parent component when location changes
    useEffect(() => {
        if (selectedLocation && onLocationSelect) {
            onLocationSelect(selectedLocation);
        }
    }, [selectedLocation, onLocationSelect]);

    // Handle location selection
    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setMapCenter(location);
    };

    // Get current location
    const getCurrentLocation = () => {
        setIsSearching(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    handleLocationSelect(newLocation);
                    setIsSearching(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setIsSearching(false);
                    alert('Unable to get your current location. Please click on the map to set your business location.');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setIsSearching(false);
            alert('Geolocation is not supported by your browser.');
        }
    };

    // Clear location
    const clearLocation = () => {
        setSelectedLocation(null);
    };

    return (
        <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">
                    📍 Click on the map to set your business location, or use the buttons below
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <motion.button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isSearching}
                    className="flex items-center px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors disabled:bg-gray-400"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSearching ? (
                        <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Getting location...
                        </>
                    ) : (
                        <>
                            <span className="mr-2">📍</span>
                            Use Current Location
                        </>
                    )}
                </motion.button>

                {selectedLocation && (
                    <motion.button
                        type="button"
                        onClick={clearLocation}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Clear Location
                    </motion.button>
                )}
            </div>

            {/* OpenStreetMap with Leaflet */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg" style={{ height: '400px' }}>
                <MapContainer
                    center={[mapCenter.lat, mapCenter.lng]}
                    zoom={selectedLocation ? 15 : 12}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={selectedLocation} setPosition={handleLocationSelect} />
                </MapContainer>
            </div>

            {/* Selected Coordinates Display */}
            {selectedLocation && (
                <motion.div
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-sm font-medium text-green-800 mb-2">✅ Location Selected</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Latitude:</span>
                            <span className="ml-2 font-mono font-semibold text-gray-900">
                                {selectedLocation.lat.toFixed(6)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Longitude:</span>
                            <span className="ml-2 font-mono font-semibold text-gray-900">
                                {selectedLocation.lng.toFixed(6)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Manual Coordinate Input */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Or enter coordinates manually:</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={selectedLocation?.lat || ''}
                            onChange={(e) => {
                                const lat = parseFloat(e.target.value);
                                if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                                    const newLocation = {
                                        lat,
                                        lng: selectedLocation?.lng || 0
                                    };
                                    handleLocationSelect(newLocation);
                                }
                            }}
                            placeholder="28.6139"
                            className="input-field text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={selectedLocation?.lng || ''}
                            onChange={(e) => {
                                const lng = parseFloat(e.target.value);
                                if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                                    const newLocation = {
                                        lat: selectedLocation?.lat || 0,
                                        lng
                                    };
                                    handleLocationSelect(newLocation);
                                }
                            }}
                            placeholder="77.2090"
                            className="input-field text-sm"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: You can also search for your location on{' '}
                    <a
                        href="https://www.openstreetmap.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-maroon-600 hover:underline"
                    >
                        OpenStreetMap
                    </a>
                    {' '}and copy the coordinates
                </p>
            </div>
        </div>
    );
};

export default MapLocationPicker;
