import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 1500,
  delay = 0,
  className = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    const timer = setTimeout(() => {
      setHasStarted(true);
      
      const startTime = Date.now();
      const startValue = 0;
      const endValue = target;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function - starts fast, slows down near the end
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
        setCount(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return (
    <span className={`animated-counter ${className}`}>
      {count}
    </span>
  );
};

export default AnimatedCounter;
