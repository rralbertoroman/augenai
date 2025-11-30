"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import SupabaseImage from "@/components/ui/supabase-image";

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
  color?: string;
}

interface ImageBoundingBoxesProps {
  imageUrl?: string; // For backward compatibility with external URLs
  bucketName?: string; // Supabase bucket name
  path?: string; // Path in Supabase bucket
  boxes?: BoundingBox[];
  className?: string;
}

export function ImageBoundingBoxes({
  bucketName,
  path,
  boxes = [],
  className = "",
}: ImageBoundingBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Create a color map based on class order of appearance
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    const seenLabels: string[] = [];

    boxes.forEach((box) => {
      if (box.label && !map.has(box.label)) {
        seenLabels.push(box.label);
        const colorIndex = (seenLabels.length - 1) % COLOR_PALETTE.length;
        map.set(box.label, COLOR_PALETTE[colorIndex]);
      }
    });

    return map;
  }, [boxes]);

  // Use only the boxes provided via props
  const displayBoxes = boxes;

  // Update dimensions on resize using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const img = entry.target.querySelector("img");
        if (img) {
          setDimensions({ width: img.width, height: img.height });
          // Also update natural dimensions if not set
          if (naturalDimensions.width === 0 && img.naturalWidth > 0) {
            setNaturalDimensions({
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          }
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [naturalDimensions.width]);

  // D3 Render Logic
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    // Draw boxes
    displayBoxes.forEach((box) => {
      // Box dimensions are in absolute pixels relative to the original image
      // We need to scale them to the rendered image size
      if (naturalDimensions.width === 0 || naturalDimensions.height === 0)
        return;

      const scaleX = dimensions.width / naturalDimensions.width;
      const scaleY = dimensions.height / naturalDimensions.height;

      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      // Get color from colorMap or use default
      const color = box.label
        ? colorMap.get(box.label) || "#3B82F6"
        : "#3B82F6";

      const g = svg.append("g");

      // Rectangle
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("class", "cursor-pointer hover:stroke-4 transition-all");
    });
  }, [displayBoxes, dimensions, naturalDimensions, colorMap]);

  // Extract unique labels for legend
  const uniqueLabels = Array.from(new Set(displayBoxes.map((b) => b.label)))
    .map((label) => {
      return { label, color: label ? colorMap.get(label) : undefined };
    })
    .filter((item) => item.label);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <SupabaseImage
        bucketName={bucketName!}
        path={path!}
        width={1000}
        height={1000}
        alt="Diagnosis"
        className="block max-w-full h-auto rounded-lg"
      />
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
        style={{ pointerEvents: "none" }} // Let clicks pass through if needed, or remove to interact with boxes
      />
      {/* Legend Overlay */}
      {uniqueLabels.length > 0 && (
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-md p-2 shadow-lg border border-white/10">
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
