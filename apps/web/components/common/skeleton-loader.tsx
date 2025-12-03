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
    className={clsx("animate-pulse bg-muted", className)}
    style={{
      width,
      height,
      borderRadius: typeof radius === "number" ? `${radius}px` : radius,
    }}
  />
);

export default SkeletonLoader;
