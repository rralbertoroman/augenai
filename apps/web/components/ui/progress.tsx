interface ProgressProps {
  value?: number;
  className?: string;
  isUploading?: boolean;
}

export function Progress({
  value = 0,
  className = "",
  isUploading = false,
}: ProgressProps) {
  // When uploading, always show 100% with pulsing animation
  const displayValue = isUploading ? 100 : value;

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner ${className}`}
    >
      <div
        className={`bg-primary h-2.5 rounded-full transition-all duration-300 ease-out relative shadow-sm ${
          isUploading ? "animate-pulse" : ""
        }`}
        style={{ width: `${displayValue}%` }}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
