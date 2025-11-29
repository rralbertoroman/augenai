"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

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
  imageUrl: string;
  boxes?: BoundingBox[];
  className?: string;
}

export function ImageBoundingBoxes({
  imageUrl,
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

  // Mock data if no boxes provided
  const displayBoxes = React.useMemo(() => {
    if (boxes.length > 0) return boxes;

    const mocks: BoundingBox[] = [];

    // Assume a typical retinal image size for mock data generation
    const mockImageWidth = 1000;
    const mockImageHeight = 1000;

    // Generate Microaneurysms (small, green)
    for (let i = 0; i < 50; i++) {
      mocks.push({
        id: `mock-ma-${i}`,
        x: 150 + Math.random() * 300,
        y: 100 + Math.random() * 300,
        width: 10 + Math.random() * 20,
        height: 10 + Math.random() * 20,
        label: "Microaneurisma",
        confidence: 0.8 + Math.random() * 0.19,
        color: "#4afe50", // green-400
      });
    }

    // Generate Exudates (small/medium, blue)
    for (let i = 0; i < 15; i++) {
      mocks.push({
        id: `mock-ex-${i}`,
        x: 150 + Math.random() * 400,
        y: 200 + Math.random() * 250,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
        label: "Exudado",
        confidence: 0.75 + Math.random() * 0.2,
        color: "#3030fa", // blue-400
      });
    }

    // Generate Hemorrhages (larger, violet)
    for (let i = 0; i < 3; i++) {
      mocks.push({
        id: `mock-hem-${i}`,
        x: 150 + Math.random() * 500,
        y: 300 + Math.random() * 300,
        width: 60 + Math.random() * 10,
        height: 60 + Math.random() * 10,
        label: "Hemorragia",
        confidence: 0.7 + Math.random() * 0.25,
        color: "#ff22ff", // violet-500
      });
    }

    return mocks;
  }, [boxes]);

  // Handle image load to set dimensions
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
    // We'll rely on the rendered width/height for the SVG overlay
    setDimensions({ width, height });
    setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
  };

  // Update dimensions on resize using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const img = entry.target.querySelector("img");
        if (img) {
          setDimensions({ width: img.width, height: img.height });
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

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

      const g = svg.append("g");

      // Rectangle
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "none")
        .attr("stroke", box.color || "red")
        .attr("stroke-width", 2)
        .attr("class", "cursor-pointer hover:stroke-4 transition-all");
    });
  }, [displayBoxes, dimensions, naturalDimensions]);

  // Extract unique labels for legend
  const uniqueLabels = Array.from(new Set(displayBoxes.map((b) => b.label)))
    .map((label) => {
      const box = displayBoxes.find((b) => b.label === label);
      return { label, color: box?.color };
    })
    .filter((item) => item.label);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <img
        src={imageUrl}
        alt="Diagnosis"
        className="block max-w-full h-auto rounded-lg"
        onLoad={onImageLoad}
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
                  style={{ backgroundColor: item.color || "red" }}
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
