"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Trash2,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DetectionCanvas } from "./detection-canvas";

interface BoundingBox {
  xLeft: number;
  yTop: number;
  width: number;
  height: number;
}

export interface DetectionForEditing {
  id: string;
  classId: number;
  confidence: number;
  lesion_name?: string;
  original: BoundingBox;
  current: BoundingBox;
  status: "active" | "deleted";
}

interface DetectionBBoxEditorProps {
  bucketName: string;
  storagePath: string;
  initialDetections: DetectionForEditing[];
  onSave: (detections: DetectionForEditing[]) => Promise<void>;
  onCancel: () => void;
}

export const DetectionBBoxEditor: React.FC<DetectionBBoxEditorProps> = ({
  bucketName,
  storagePath,
  initialDetections,
  onSave,
  onCancel,
}) => {
  const [detections, setDetections] =
    useState<DetectionForEditing[]>(initialDetections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPanMode, setIsPanMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Load image from Supabase
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!storagePath || !bucketName) {
        console.error("No storage path or bucket name provided");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: signedData, error: signedErr } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(storagePath, 600);

        if (signedErr || !signedData?.signedUrl) {
          throw signedErr || new Error("No URL");
        }

        if (mounted) {
          setImageUrl(signedData.signedUrl);
          setLoading(false);
        }
      } catch (e) {
        console.error("[DetectionBBoxEditor] Error loading image:", e);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bucketName, storagePath]);

  // Handle wheel zoom on the entire editor
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoomLevel((prev) => Math.min(Math.max(50, prev + delta), 200));
  }, []);

  const handleSelectDetection = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleUpdateDetection = useCallback(
    (id: string, current: BoundingBox) => {
      setDetections((prev) =>
        prev.map((d) => (d.id === id ? { ...d, current } : d)),
      );
    },
    [],
  );

  const handleDeleteDetection = useCallback(
    (id: string) => {
      setDetections((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: "deleted" as const } : d,
        ),
      );
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId],
  );

  const handleImageLoad = useCallback(
    (dimensions: { width: number; height: number }) => {
      setImageDimensions(dimensions);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(detections);
    } catch (error) {
      console.error("Error saving detections:", error);
    } finally {
      setSaving(false);
    }
  }, [detections, onSave]);

  const activeCount = detections.filter((d) => d.status === "active").length;

  return (
    <div
      className="fixed inset-0 flex flex-col bg-background z-50"
      onWheel={handleWheel}
    >
      {/* Toolbar - Fixed at top */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0 gap-2 shadow-sm">
        {/* Left: Title */}
        <div className="flex-col min-w-0 shrink hidden sm:flex">
          <h2 className="text-sm font-semibold text-foreground truncate">
            Editor de Detecciones
          </h2>
          {imageDimensions.width > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {imageDimensions.width}x{imageDimensions.height}
            </p>
          )}
        </div>

        {/* Center: Tools & Zoom */}
        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <div className="flex items-center bg-muted rounded-md p-0.5 border border-border mr-2 shrink-0">
            <Button
              variant={!isPanMode ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsPanMode(false)}
              title="Editar"
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button
              variant={isPanMode ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsPanMode(true)}
              title="Mover"
            >
              <Hand className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>

            <div className="w-24 sm:w-32">
              <Slider
                value={[zoomLevel]}
                onValueChange={(value) => setZoomLevel(value[0])}
                min={50}
                max={200}
                step={5}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium w-10 text-center hidden sm:inline-block">
              {zoomLevel}%
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="h-8 px-3"
          >
            <X className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Cancelar</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="h-8 px-3"
          >
            {saving ? (
              <span className="text-xs">Guardando...</span>
            ) : (
              <>
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Guardar</span>
                <span className="sm:hidden">OK</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Canvas Area - Takes remaining space */}
      <main className="flex-1 relative overflow-hidden">
        <DetectionCanvas
          imageUrl={imageUrl}
          loading={loading}
          detections={detections}
          selectedId={selectedId}
          isPanMode={isPanMode}
          zoomLevel={zoomLevel}
          onSelectDetection={handleSelectDetection}
          onUpdateDetection={handleUpdateDetection}
          onDeleteDetection={handleDeleteDetection}
          onImageLoad={handleImageLoad}
        />
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="bg-card border-t border-border flex flex-col items-center justify-center px-4 py-2 text-xs text-muted-foreground shrink-0 select-none shadow-sm gap-1">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          <span className="font-medium text-primary">
            Activas: {activeCount}
          </span>
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <span>
            {isPanMode
              ? "Arrastra para mover imagen"
              : "Arrastra cajas para editar"}
          </span>
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <span className="hidden sm:inline">
            Click <Trash2 className="inline h-3 w-3 mx-0.5 mb-0.5" /> para
            eliminar
          </span>
          <span className="hidden md:inline text-muted-foreground/50">•</span>
          <span className="hidden md:inline">Rueda para zoom</span>
        </div>
        <div className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
          ⚠️ Solo podrá brindar una retroalimentación para esta predicción.
          Realícela con cuidado.
        </div>
      </footer>
    </div>
  );
};
