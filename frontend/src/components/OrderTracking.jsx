import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketProvider';

const OrderTracking = ({ orderId, subscriptionId }) => {
    const { socket, isConnected, joinRoom, leaveRoom } = useSocket();
    const [orderStatus, setOrderStatus] = useState('confirmed');
    const [estimatedTime, setEstimatedTime] = useState('30-45 mins');

    const statusSteps = [
        { key: 'confirmed', label: 'Confirmed', icon: '✅' },
        { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴' },
        { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    useEffect(() => {
        if (socket && orderId) {
            // Join order room
            joinRoom({ type: 'order', id: orderId });

            // Listen for order updates
            socket.on('order:update', (data) => {
                if (data.orderId === orderId) {
                    setOrderStatus(data.status);
                    if (data.estimatedTime) {
                        setEstimatedTime(data.estimatedTime);
                    }
                }
            });

            return () => {
                leaveRoom({ type: 'order', id: orderId });
            };
        }
    }, [socket, orderId]);

    const getStepIndex = (status) => {
        return statusSteps.findIndex(step => step.key === status);
    };

    const currentStepIndex = getStepIndex(orderStatus);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Tracking</h3>
                {isConnected ? (
                    <span className="flex items-center gap-2 text-sm text-green-600">
                        <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></span>
                        Live Tracking
                    </span>
                ) : (
                    <span className="text-sm text-gray-500">Offline</span>
                )}
            </div>

            {/* Status Stepper */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{
                            width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
                        }}
                    ></div>
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.key} className="flex flex-col items-center">
                                <div
                                    className={`
                                        h-12 w-12 rounded-full flex items-center justify-center text-2xl
                                        transition-all duration-300 z-10
                                        ${isCompleted
                                            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg scale-110'
                                            : 'bg-gray-200'
                                        }
                                        ${isCurrent ? 'ring-4 ring-green-200 animate-pulse' : ''}
                                    `}
                                >
                                    {step.icon}
                                </div>
                                <p
                                    className={`
                                        mt-2 text-sm font-medium text-center
                                        ${isCompleted ? 'text-gray-900' : 'text-gray-500'}
                                    `}
                                >
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Estimated Time */}
            {orderStatus !== 'delivered' && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                        <span className="font-semibold">Estimated Delivery:</span> {estimatedTime}
                    </p>
                </div>
            )}

            {/* Delivered Message */}
            {orderStatus === 'delivered' && (
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-900 font-semibold">
                        🎉 Your order has been delivered! Enjoy your meal!
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
