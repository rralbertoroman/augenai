import React from "react";
import clsx from "clsx";

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  width = "100%",
  height = 20,
  radius = 8,
}) => (
  <div
    className={clsx("animate-pulse", className)}
    style={{
      width,
      height,
      borderRadius: typeof radius === "number" ? `${radius}px` : radius,
      background:
        "linear-gradient(90deg, rgba(46,238,108,0.10) 0%, rgba(220,220,220,0.18) 100%)",
    }}
  />
);

export default SkeletonLoader;
