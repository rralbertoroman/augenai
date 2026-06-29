"use client";

import { useMemo } from "react";
import SupabaseImage from "./supabase-image";

// Color palette with tones of blue, green, violet, and pink
const COLOR_PALETTE = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#2563EB", // Dark Blue
  "#059669", // Dark Green
  "#7C3AED", // Dark Violet
  "#DB2777", // Dark Pink
  "#60A5FA", // Light Blue
  "#34D399", // Light Green
  "#A78BFA", // Light Violet
  "#F472B6", // Light Pink
];

export interface BoundingBox {
  id: string;
  x: number; // x coordinate (relative 0-1 or absolute pixels)
  y: number; // y coordinate (relative 0-1 or absolute pixels)
  width: number; // width (relative 0-1 or absolute pixels)
  height: number; // height (relative 0-1 or absolute pixels)
  label?: string;
  confidence?: number;
}

export interface Polygon {
  points: number[][]; // [[x, y], ...] in absolute image pixels
  label?: string;
}

interface ImageBoundingBoxesProps {
  imageUrl?: string; // For backward compatibility with external URLs
  bucketName?: string; // Supabase bucket name
  path?: string; // Path in Supabase bucket
  boxes?: BoundingBox[];
  polygons?: Polygon[];
  className?: string;
}

export function ImageBoundingBoxes({
  bucketName,
  path,
  boxes = [],
  polygons = [],
  className = "",
}: ImageBoundingBoxesProps) {
  // Create a color map based on class order of appearance
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const seenLabels: string[] = [];

    const assignColor = (label?: string) => {
      if (label && !map.has(label)) {
        seenLabels.push(label);
        const colorIndex = (seenLabels.length - 1) % COLOR_PALETTE.length;
        map.set(label, COLOR_PALETTE[colorIndex]);
      }
    };

    boxes.forEach((box) => assignColor(box.label));
    polygons.forEach((polygon) => assignColor(polygon.label));

    return map;
  }, [boxes, polygons]);

  // Extract unique labels for legend (boxes + polygons)
  const uniqueLabels = Array.from(
    new Set([...boxes.map((b) => b.label), ...polygons.map((p) => p.label)]),
  )
    .map((label) => {
      return { label, color: label ? colorMap.get(label) : undefined };
    })
    .filter((item) => item.label);

  return (
    <div className={`relative inline-block w-auto ${className}`}>
      <SupabaseImage
        bucketName={bucketName!}
        path={path!}
        width={1000}
        height={1000}
        alt="Diagnosis"
        className="block max-w-full h-auto rounded-lg"
        boundingBoxes={boxes}
        polygons={polygons}
        colorMap={colorMap}
      />
      {/* Legend Overlay */}
      {uniqueLabels.length > 0 && (
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-md p-2 shadow-lg border border-white/10 z-5">
          <div className="flex flex-col gap-1">
            {uniqueLabels.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || "#3B82F6" }}
                />
                <span className="text-xs font-medium text-white">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
