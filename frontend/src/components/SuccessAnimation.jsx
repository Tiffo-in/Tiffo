import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import successAnimation from '../assets/lottie/success-checkmark.json';

const SuccessAnimation = ({ show, message = 'Welcome back!', onComplete }) => {
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        if (show) {
            // Generate confetti particles
            const particles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: -10,
                rotation: Math.random() * 360,
                color: ['#9f1239', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 5)],
                size: Math.random() * 10 + 5,
                delay: Math.random() * 0.5,
                duration: Math.random() * 2 + 2,
            }));
            setConfetti(particles);

            // Auto-complete after animation
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    {/* Confetti Particles */}
                    {confetti.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="absolute"
                            style={{
                                left: `${particle.x}%`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                backgroundColor: particle.color,
                                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                            }}
                            initial={{
                                y: particle.y,
                                rotate: 0,
                                opacity: 1,
                            }}
                            animate={{
                                y: window.innerHeight + 100,
                                rotate: particle.rotation * 4,
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: particle.duration,
                                delay: particle.delay,
                                ease: 'easeIn',
                            }}
                        />
                    ))}

                    {/* Success Message Card */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4"
                    >
                        {/* Lottie Success Animation */}
                        <motion.div
                            className="flex justify-center mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            <div className="w-32 h-32">
                                <Lottie
                                    animationData={successAnimation}
                                    loop={false}
                                    autoplay={true}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </motion.div>

                        {/* Success Message */}
                        <motion.h2
                            className="text-3xl font-bold text-center text-gray-900 mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Login Successful!
                        </motion.h2>

                        <motion.p
                            className="text-lg text-center text-gray-600 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {message}
                        </motion.p>

                        {/* Loading Dots */}
                        <div className="flex justify-center space-x-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-3 h-3 bg-maroon-600 rounded-full"
                                    animate={{
                                        y: [0, -15, 0],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Redirecting Text */}
                        <motion.p
                            className="text-sm text-center text-gray-500 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            Redirecting to your dashboard...
                        </motion.p>
                    </motion.div>

                    {/* Sparkle Effects */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={`sparkle-${i}`}
                            className="absolute text-4xl"
                            style={{
                                left: `${20 + (i * 10)}%`,
                                top: `${30 + (i % 2) * 20}%`,
                            }}
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 1,
                                delay: 0.5 + i * 0.1,
                                repeat: 2,
                            }}
                        >
                            ✨
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessAnimation;
