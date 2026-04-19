import React from 'react';
import Lottie from 'lottie-react';

/**
 * Reusable Lottie animation player component
 * @param {Object} animationData - Lottie JSON animation data
 * @param {boolean} loop - Whether to loop the animation (default: true)
 * @param {boolean} autoplay - Whether to autoplay the animation (default: true)
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 * @param {Function} onComplete - Callback when animation completes
 * @param {Function} onLoopComplete - Callback when a loop completes
 */
const LottiePlayer = ({
    animationData,
    loop = true,
    autoplay = true,
    className = '',
    style = {},
    onComplete,
    onLoopComplete,
    ...props
}) => {
    const defaultStyle = {
        width: '100%',
        height: '100%',
        ...style,
    };

    return (
        <Lottie
            animationData={animationData}
            loop={loop}
            autoplay={autoplay}
            className={className}
            style={defaultStyle}
            onComplete={onComplete}
            onLoopComplete={onLoopComplete}
            {...props}
        />
    );
};

export default LottiePlayer;
