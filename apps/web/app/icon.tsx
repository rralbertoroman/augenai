import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified version of augen logo - two eye-like curves with central circle */}
          {/* Left eye curve - enlarged */}
          <path
            d="M12 8 C8 8 6 12 6 16 C6 20 8 24 12 24"
            stroke="#2DA62D"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Right eye curve - enlarged */}
          <path
            d="M20 8 C24 8 26 12 26 16 C26 20 24 24 20 24"
            stroke="#2DA62D"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Central circle - enlarged */}
          <circle cx="16" cy="16" r="6" fill="#2DA62D" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
