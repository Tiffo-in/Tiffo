import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ density = 'medium' }) => {
    const densityMap = {
        low: 5,
        medium: 10,
        high: 15
    };

    const particleCount = densityMap[density] || 10;
    const foodEmojis = ['🍛', '🍱', '🥘', '🍲', '🍜', '🥗', '🍝'];

    const getRandomPosition = () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
    });

    const getRandomDuration = () => 8 + Math.random() * 8; // 8-16 seconds

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
            {[...Array(particleCount)].map((_, i) => {
                const position = getRandomPosition();
                const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
                const duration = getRandomDuration();

                return (
                    <motion.div
                        key={i}
                        className="absolute text-4xl"
                        style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                        }}
                        animate={{
                            y: [-20, -80, -20],
                            x: [-10, 10, -10],
                            rotate: [0, 360, 0],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                    >
                        {emoji}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default AnimatedBackground;
