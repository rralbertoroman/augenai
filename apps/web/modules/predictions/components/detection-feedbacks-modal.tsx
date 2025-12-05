"use client";

import React, { useState, useEffect } from "react";
import { ClipboardDialog } from "@/modules/commons/clipboard/clipboard-dialog";
import type { DetectionFeedbackWithExtras } from "@/server/zod-schemas/detection_feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/modules/predictions/hooks/use-prediction-requests";
import { Star, Eye, EyeOff, ZoomIn, ZoomOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DetectionFeedbacksModalProps {
  open: boolean;
  onClose: () => void;
  feedbacks: DetectionFeedbackWithExtras[];
  lesionName?: string;
  originalBbox?: {
    xLeft: number;
    yTop: number;
    width: number;
    height: number;
  };
  isRequestOwner: boolean;
  updatingFeedbackId: string | null;
  onSetMainFeedback: (feedbackId: string) => Promise<void>;
  bucketName?: string;
  storagePath?: string;
}

// Component for a single image preview with bbox
function ImagePreviewBox({
  imageUrl,
  bbox,
  title,
  borderColor,
  zoom,
  isDeleted,
}: {
  imageUrl: string;
  bbox?: { xLeft: number; yTop: number; width: number; height: number };
  title: string;
  borderColor: string;
  zoom: number;
  isDeleted?: boolean;
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setDimensions({ width: img.width, height: img.height });
  };

  const scaleX =
    dimensions.width > 0 && naturalDimensions.width > 0
      ? dimensions.width / naturalDimensions.width
      : 1;
  const scaleY =
    dimensions.height > 0 && naturalDimensions.height > 0
      ? dimensions.height / naturalDimensions.height
      : 1;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <p className="text-xs font-semibold text-center mb-2 text-muted-foreground">
        {title}
      </p>
      <div
        className="relative bg-black rounded-lg overflow-auto flex-1"
        style={{ maxHeight: "220px" }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: "fit-content",
          }}
        >
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt={title}
              className="block max-w-full h-auto"
              onLoad={handleLoad}
              style={{ maxHeight: zoom === 1 ? "210px" : "none" }}
            />
            {bbox && naturalDimensions.width > 0 && !isDeleted && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: bbox.xLeft * scaleX,
                  top: bbox.yTop * scaleY,
                  width: bbox.width * scaleX,
                  height: bbox.height * scaleY,
                  border: `3px solid ${borderColor}`,
                  boxShadow: `0 0 0 1px rgba(0,0,0,0.5)`,
                }}
              />
            )}
            {isDeleted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Badge variant="destructive" className="text-sm">
                  Eliminada por el usuario
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetectionFeedbacksModal({
  open,
  onClose,
  feedbacks,
  lesionName,
  originalBbox,
  isRequestOwner,
  updatingFeedbackId,
  onSetMainFeedback,
  bucketName,
  storagePath,
}: DetectionFeedbacksModalProps) {
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null,
  );
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState(true); // Show by default
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open && bucketName && storagePath) {
      const loadImage = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(storagePath, 600);

          if (!error && data?.signedUrl) {
            setImageUrl(data.signedUrl);
          }
        } catch (e) {
          console.error("Error loading image:", e);
        }
      };
      loadImage();
    }
  }, [open, bucketName, storagePath]);

  // Auto-select first feedback when modal opens
  useEffect(() => {
    if (open && feedbacks.length > 0 && !selectedFeedbackId) {
      setSelectedFeedbackId(feedbacks[0].id);
    }
  }, [open, feedbacks, selectedFeedbackId]);

  useEffect(() => {
    if (!open) {
      setSelectedFeedbackId(null);
      setShowPreview(true);
      setZoom(1);
    }
  }, [open]);

  const selectedFeedback = feedbacks.find((f) => f.id === selectedFeedbackId);

  const isDeleted = (feedback: DetectionFeedbackWithExtras) =>
    feedback.xLeft === 0 &&
    feedback.yTop === 0 &&
    feedback.width === 0 &&
    feedback.height === 0;

  return (
    <ClipboardDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={`Feedbacks de ${lesionName || "Detección"}`}
    >
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Lesión: <span className="font-semibold">{lesionName}</span>
            </p>
            {originalBbox && (
              <p className="text-xs text-muted-foreground font-mono">
                Original: ({originalBbox.xLeft.toFixed(0)},{" "}
                {originalBbox.yTop.toFixed(0)}) {originalBbox.width.toFixed(0)}x
                {originalBbox.height.toFixed(0)}
              </p>
            )}
          </div>
          {imageUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPreview ? "Ocultar" : "Ver"}
            </Button>
          )}
        </div>

        {/* Side by side previews - Original vs Feedback */}
        {showPreview && imageUrl && originalBbox && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Comparación visual
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground w-8 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <ImagePreviewBox
                imageUrl={imageUrl}
                bbox={originalBbox}
                title="Original"
                borderColor="#ffffff"
                zoom={zoom}
              />

              {selectedFeedback && (
                <ImagePreviewBox
                  imageUrl={imageUrl}
                  bbox={{
                    xLeft: selectedFeedback.xLeft,
                    yTop: selectedFeedback.yTop,
                    width: selectedFeedback.width,
                    height: selectedFeedback.height,
                  }}
                  title="Modificación"
                  borderColor="#22c55e"
                  zoom={zoom}
                  isDeleted={isDeleted(selectedFeedback)}
                />
              )}
            </div>
          </div>
        )}

        {/* Feedbacks list */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No hay retroalimentaciones
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Retroalimentaciones ({feedbacks.length})
            </p>
            {feedbacks.map((feedback) => {
              const deleted = isDeleted(feedback);
              const isSelected = selectedFeedbackId === feedback.id;

              return (
                <div
                  key={feedback.id}
                  onClick={() => setSelectedFeedbackId(feedback.id)}
                  className={`relative bg-card border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {feedback.user_name}
                        </span>
                        {deleted ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Eliminada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Modificada
                          </Badge>
                        )}
                        {feedback.isMainUser && (
                          <Badge variant="outline" className="text-[10px]">
                            Usuario Principal
                          </Badge>
                        )}
                      </div>
                      {!deleted && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">
                          → ({feedback.xLeft.toFixed(0)},{" "}
                          {feedback.yTop.toFixed(0)}){" "}
                          {feedback.width.toFixed(0)}x
                          {feedback.height.toFixed(0)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {feedback.isMainData ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px]">
                          <Star className="h-2.5 w-2.5 mr-1 fill-current" />
                          Principal
                        </Badge>
                      ) : isRequestOwner ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetMainFeedback(feedback.id);
                          }}
                          disabled={updatingFeedbackId === feedback.id}
                        >
                          <Star className="h-2.5 w-2.5 mr-1" />
                          {updatingFeedbackId === feedback.id
                            ? "..."
                            : "Principal"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClipboardDialog>
  );
}
