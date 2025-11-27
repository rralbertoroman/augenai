import React from 'react';

interface AnimatedAugenIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'pulse' | 'bounce' | 'spin' | 'float' | 'ping' | 'none';
  animated?: boolean;
  color?: string;
}

const AnimatedAugenIcon: React.FC<AnimatedAugenIconProps> = ({
  className = '',
  size = 'md',
  animation = 'none',
  animated = true,
  color = '#2DA62D',
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Animation classes
  let animationClass = '';
  if (animated) {
    switch (animation) {
      case 'pulse':
        animationClass = 'animate-pulse';
        break;
      case 'bounce':
        animationClass = 'animate-bounce';
        break;
      case 'spin':
        animationClass = 'animate-spin';
        break;
      case 'float':
        animationClass = 'animate-float';
        break;
      case 'ping':
        animationClass = 'animate-ping';
        break;
      case 'none':
        animationClass = '';
        break;
    }
  }

  // Custom styles for animations not in base Tailwind
  const style = animation === 'float' && animated ? `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
  ` : '';

  return (
    <>
      <style>{style}</style>
      <div className={`${sizeClasses[size]} ${animationClass} ${className}`} style={{ color }}>
        <svg
          viewBox="197 -4 440 186"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M417 182C467.258 182 508 141.258 508 91C508 40.7421 467.258 0 417 0C366.742 0 326 40.7421 326 91C326 141.258 366.742 182 417 182Z"
            fill="currentColor"
          />
          <path
            d="M561.925 180.611C604.59 173.08 637 135.825 637 90.9999C637 46.1748 604.59 8.91938 561.925 1.38868C553.223 -0.147316 546 7.16331 546 15.9999V166C546 174.837 553.223 182.147 561.925 180.611Z"
            fill="currentColor"
          />
          <path
            d="M272.075 180.611C229.41 173.08 197 135.825 197 90.9999C197 46.1748 229.41 8.91938 272.075 1.38868C280.777 -0.147316 288 7.16331 288 15.9999V166C288 174.837 280.777 182.147 272.075 180.611Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </>
  );
};

export default AnimatedAugenIcon;