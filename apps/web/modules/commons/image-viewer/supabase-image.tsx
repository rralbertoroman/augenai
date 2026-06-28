"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

const urlCache = new Map<string, { url: string; expiresAt: number }>();

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  confidence?: number;
}

interface Polygon {
  points: number[][]; // [[x, y], ...] in absolute image pixels
  label?: string;
}

interface SupabaseImageProps {
  width: number;
  height: number;
  bucketName: string;
  path: string;
  alt?: string;
  className?: string;
  quality?: number;
  unoptimized?: boolean;
  expiry?: number;
  fallback?: string;
  enableLightbox?: boolean;
  boundingBoxes?: BoundingBox[];
  polygons?: Polygon[];
  colorMap?: Map<string, string>;
}

export default function SupabaseImage({
  width,
  height,
  bucketName,
  path,
  alt = "",
  className,
  quality = 75,
  unoptimized = true,
  expiry = 600,
  fallback = "file.svg",
  enableLightbox = true,
  boundingBoxes = [],
  polygons = [],
  colorMap,
}: SupabaseImageProps) {
  const [src, setSrc] = useState<string>(fallback);
  const [open, setOpen] = useState(false);
  const [compositeImage, setCompositeImage] = useState<string>("");
  const [imgDimensions, setImgDimensions] = useState({
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightboxImageRef = useRef<HTMLImageElement>(null);

  // Draw bounding boxes and polygons on canvas when image or overlays change
  useEffect(() => {
    if (
      !canvasRef.current ||
      !imgDimensions.width ||
      (boundingBoxes.length === 0 && polygons.length === 0)
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match displayed image
    canvas.width = imgDimensions.width;
    canvas.height = imgDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = imgDimensions.width / imgDimensions.naturalWidth;
    const scaleY = imgDimensions.height / imgDimensions.naturalHeight;

    // Draw each bounding box
    boundingBoxes.forEach((box) => {
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      const color =
        box.label && colorMap
          ? colorMap.get(box.label) || "#3B82F6"
          : "#3B82F6";

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    });

    // Draw each polygon
    polygons.forEach((polygon) => {
      if (!polygon.points || polygon.points.length === 0) return;

      const color =
        polygon.label && colorMap
          ? colorMap.get(polygon.label) || "#3B82F6"
          : "#3B82F6";

      ctx.beginPath();
      polygon.points.forEach((point, index) => {
        const px = point[0] * scaleX;
        const py = point[1] * scaleY;
        if (index === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.closePath();

      // Semi-transparent fill, solid stroke
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [boundingBoxes, polygons, imgDimensions, colorMap]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!path) {
        throw new Error("No se proporcionó path de imagen");
      }

      const cacheKey = `${bucketName}/${path}`;
      const cached = urlCache.get(cacheKey);
      const now = Date.now();

      if (cached && cached.expiresAt > now) {
        if (mounted) setSrc(cached.url);
        return;
      }

      try {
        const supabase = createClient();
        const { data: signedData, error: signedErr } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(path as string, expiry);

        if (signedErr || !signedData?.signedUrl)
          throw signedErr || new Error("No URL");

        const signedUrl = signedData.signedUrl;
        const expiresAt = now + (expiry - 60) * 1000;
        urlCache.set(cacheKey, { url: signedUrl, expiresAt });

        if (mounted) setSrc(signedUrl);
      } catch (e) {
        console.error("[SupabaseImage]", e);
        throw new Error(
          `Error al cargar imagen: ${e instanceof Error ? e.message : "Error desconocido"}`,
        );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bucketName, path, expiry, fallback]);

  if (!enableLightbox) {
    return (
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        className={className}
        quality={quality}
        unoptimized={unoptimized}
      />
    );
  }

  const captureRenderedContent = async () => {
    setCompositeImage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const imgElement = containerRef.current?.querySelector("img");
      if (!imgElement) {
        console.warn("No image element found");
        setCompositeImage(src);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = imgDimensions.width;
      canvas.height = imgDimensions.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setCompositeImage(src);
        return;
      }

      // Load base image using native browser Image constructor
      const baseImage = document.createElement("img") as HTMLImageElement;
      baseImage.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        baseImage.onload = () => resolve();
        baseImage.onerror = () => reject(new Error("Failed to load image"));
        baseImage.src = src;
      });

      // Draw base image
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes / polygons if present
      if (
        (boundingBoxes.length > 0 || polygons.length > 0) &&
        canvasRef.current
      ) {
        ctx.drawImage(canvasRef.current, 0, 0);
      }

      const compositeDataUrl = canvas.toDataURL("image/png", 1.0);
      setCompositeImage(compositeDataUrl);
    } catch (error) {
      console.error("Error creating composite image:", error);
      setCompositeImage(src);
    }
  };

  const handleOpenLightbox = async () => {
    await captureRenderedContent();
    setZoom(1);
    setOpen(true);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(0.5, prev * delta), 5));
  };

  // Get unique labels for legend (boxes + polygons)
  const uniqueLabels = Array.from(
    new Set([
      ...boundingBoxes.map((b) => b.label),
      ...polygons.map((p) => p.label),
    ]),
  )
    .map((label) => {
      return {
        label,
        color: label && colorMap ? colorMap.get(label) : undefined,
      };
    })
    .filter((item) => item.label);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div ref={containerRef} className="relative inline-block">
          <Button
            ref={buttonRef}
            type="button"
            variant="ghost"
            className={className}
            style={{ padding: 0 }}
            aria-label={alt}
            onClick={handleOpenLightbox}
          >
            <Image
              src={src}
              width={width}
              height={height}
              alt={alt}
              quality={quality}
              unoptimized={unoptimized}
              onLoad={(e) => {
                const img = e.currentTarget;
                setImgDimensions({
                  width: img.width,
                  height: img.height,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                });
              }}
            />
          </Button>
          {(boundingBoxes.length > 0 || polygons.length > 0) && (
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </DialogTrigger>
      <DialogTitle />
      <DialogContent
        showCloseButton={false}
        className="p-0 m-0 bg-black backdrop-blur-sm border overflow-hidden max-w-[68vw] max-h-[98vh] border-muted rounded-lg"
      >
        <div
          className="relative flex items-center justify-center overflow-hidden bg-black "
          onWheel={handleWheel}
        >
          <img
            ref={lightboxImageRef}
            src={compositeImage || src}
            alt={alt}
            className="object-contain transition-transform bg-black/95 "
            style={{
              width: "95%",
              height: "95%",
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          />

          {/* Legend */}
          {uniqueLabels.length > 0 && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-md p-3 shadow-lg border border-white/10 z-5">
              <div className="flex flex-col gap-2">
                {uniqueLabels.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || "#3B82F6" }}
                    />
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
            Zoom: {Math.round(zoom * 100)}% | Rueda del ratón para zoom | ESC
            para cerrar
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
