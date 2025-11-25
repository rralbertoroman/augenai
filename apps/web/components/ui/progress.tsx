import { useEffect, useState } from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = "" }: ProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate from current value to new value
    const startValue = displayValue;
    const endValue = Math.min(100, Math.max(0, value));
    const duration = 300; // ms
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner ${className}`}
    >
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out relative shadow-sm"
        style={{ width: `${displayValue}%` }}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
