"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetectionForEditing } from "./detection-bbox-editor";

interface DetectionCanvasProps {
  imageUrl: string;
  loading: boolean;
  detections: DetectionForEditing[];
  selectedId: string | null;
  isPanMode: boolean;
  zoomLevel: number;
  onSelectDetection: (id: string | null) => void;
  onUpdateDetection: (
    id: string,
    current: DetectionForEditing["current"],
  ) => void;
  onDeleteDetection: (id: string) => void;
  onImageLoad: (dimensions: { width: number; height: number }) => void;
}

const Skeleton = () => (
  <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
    <div className="relative w-[80%] max-w-2xl aspect-[4/3] bg-muted-foreground/10 rounded-lg animate-pulse flex items-center justify-center">
      <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded" />
      <span className="text-muted-foreground/40 text-sm">
        Cargando imagen...
      </span>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
    <p className="text-destructive">Error al cargar la imagen</p>
  </div>
);

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  imageUrl,
  loading,
  detections,
  selectedId,
  isPanMode,
  zoomLevel,
  onSelectDetection,
  onUpdateDetection,
  onDeleteDetection,
  onImageLoad,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [baseScale, setBaseScale] = useState(1);
  const [imageNaturalDimensions, setImageNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Interaction states
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [isResizingBox, setIsResizingBox] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Pan states
  const [isPanningImage, setIsPanningImage] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const scale = baseScale * (zoomLevel / 100);

  // Calculate base scale to fit image in wrapper
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current && imageNaturalDimensions.width > 0) {
        const wrapperWidth = wrapperRef.current.clientWidth;
        const wrapperHeight = wrapperRef.current.clientHeight;

        const availableWidth = wrapperWidth - 64;
        const availableHeight = wrapperHeight - 64;

        const scaleX = availableWidth / imageNaturalDimensions.width;
        const scaleY = availableHeight / imageNaturalDimensions.height;

        const fitScale = Math.min(scaleX, scaleY, 1);
        setBaseScale(fitScale);
        setPanPosition({ x: 0, y: 0 });
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [imageNaturalDimensions]);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
      setImageNaturalDimensions(dimensions);
      onImageLoad(dimensions);
    },
    [onImageLoad],
  );

  const handleWrapperMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanMode) {
        onSelectDetection(null);
        return;
      }
      if (e.button !== 0) return;

      e.preventDefault();
      setIsPanningImage(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    },
    [isPanMode, panPosition, onSelectDetection],
  );

  // Handle mouse move for panning and box interactions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanningImage) {
        setPanPosition({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
        return;
      }

      if (isDraggingBox && selectedId && containerRef.current) {
        const detection = detections.find((d) => d.id === selectedId);
        if (!detection) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        const newX = Math.max(
          0,
          Math.min(
            imageNaturalDimensions.width - detection.current.width,
            x - dragOffset.x,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            imageNaturalDimensions.height - detection.current.height,
            y - dragOffset.y,
          ),
        );

        onUpdateDetection(selectedId, {
          ...detection.current,
          xLeft: newX,
          yTop: newY,
        });
      }

      if (isResizingBox && selectedId && containerRef.current) {
        const detection = detections.find((d) => d.id === selectedId);
        if (!detection) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        const newWidth = Math.min(
          imageNaturalDimensions.width - detection.current.xLeft,
          Math.max(10, x - detection.current.xLeft),
        );
        const newHeight = Math.min(
          imageNaturalDimensions.height - detection.current.yTop,
          Math.max(10, y - detection.current.yTop),
        );

        onUpdateDetection(selectedId, {
          ...detection.current,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsPanningImage(false);
      setIsDraggingBox(false);
      setIsResizingBox(false);
    };

    if (isPanningImage || isDraggingBox || isResizingBox) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isPanningImage,
    isDraggingBox,
    isResizingBox,
    selectedId,
    panStart,
    dragOffset,
    scale,
    detections,
    imageNaturalDimensions,
    onUpdateDetection,
  ]);

  const onBoxMouseDown = useCallback(
    (e: React.MouseEvent, boxId: string, handle: string | null) => {
      if (isPanMode) return;

      e.stopPropagation();
      e.preventDefault();

      onSelectDetection(boxId);

      if (handle === "se") {
        setIsResizingBox(true);
      } else {
        const detection = detections.find((d) => d.id === boxId);
        if (!detection || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setDragOffset({
          x: x - detection.current.xLeft,
          y: y - detection.current.yTop,
        });
        setIsDraggingBox(true);
      }
    },
    [isPanMode, detections, scale, onSelectDetection],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "absolute inset-0 overflow-hidden flex items-center justify-center bg-muted select-none",
        isPanMode
          ? isPanningImage
            ? "cursor-grabbing"
            : "cursor-grab"
          : "cursor-default",
      )}
      onMouseDown={handleWrapperMouseDown}
    >
      {loading ? (
        <Skeleton />
      ) : !imageUrl ? (
        <ErrorState />
      ) : (
        <div
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
            transition: isPanningImage ? "none" : "transform 0.1s ease-out",
            willChange: "transform",
          }}
        >
          <div
            ref={containerRef}
            style={{
              width: imageNaturalDimensions.width * scale,
              height: imageNaturalDimensions.height * scale,
              position: "relative",
              flexShrink: 0,
            }}
            className="shadow-2xl ring-1 ring-border bg-black"
          >
            <img
              src={imageUrl}
              alt="Imagen para edición"
              className="w-full h-full object-contain pointer-events-none block"
              draggable={false}
              onLoad={handleImageLoad}
            />

            {/* Detections Layer */}
            {detections.map((det) => {
              if (det.status === "deleted") return null;
              const isSelected = selectedId === det.id;

              return (
                <div
                  key={det.id}
                  onMouseDown={(e) => onBoxMouseDown(e, det.id, null)}
                  className={cn(
                    "absolute group transition-colors duration-75",
                    !isPanMode && "cursor-move",
                  )}
                  style={{
                    left: det.current.xLeft * scale,
                    top: det.current.yTop * scale,
                    width: det.current.width * scale,
                    height: det.current.height * scale,
                    borderWidth: isSelected ? "2px" : "1px",
                    borderColor: isSelected ? "hsl(var(--primary))" : "white",
                    borderStyle: "solid",
                    zIndex: isSelected ? 50 : 10,
                    boxShadow: isSelected
                      ? "0 0 0 2px hsl(var(--primary) / 0.3)"
                      : "none",
                    pointerEvents: isPanMode ? "none" : "auto",
                  }}
                >
                  {det.lesion_name && (
                    <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap pointer-events-none shadow-sm">
                      {det.lesion_name} ({(det.confidence * 100).toFixed(1)}%)
                    </div>
                  )}

                  {isSelected && !isPanMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDetection(det.id);
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-destructive hover:bg-destructive/90 rounded-full flex items-center justify-center text-destructive-foreground shadow-sm z-50 scale-0 group-hover:scale-100 transition-transform duration-200 ease-out"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}

                  {isSelected && !isPanMode && (
                    <div
                      onMouseDown={(e) => onBoxMouseDown(e, det.id, "se")}
                      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center translate-x-1/2 translate-y-1/2"
                    >
                      <div className="w-2.5 h-2.5 bg-primary border border-white rounded-sm shadow-sm" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
