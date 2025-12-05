"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DetectionBBoxEditor,
  type DetectionForEditing,
} from "./detection-bbox-editor";

interface DetectionFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucketName: string;
  storagePath: string;
  detections: DetectionForEditing[];
  onSave: (detections: DetectionForEditing[]) => Promise<void>;
}

export const DetectionFeedbackModal: React.FC<DetectionFeedbackModalProps> = ({
  open,
  onOpenChange,
  bucketName,
  storagePath,
  detections,
  onSave,
}) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = async (updatedDetections: DetectionForEditing[]) => {
    await onSave(updatedDetections);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-screen h-screen p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Editor de Detecciones</DialogTitle>
        </VisuallyHidden>
        <DetectionBBoxEditor
          bucketName={bucketName}
          storagePath={storagePath}
          initialDetections={detections}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
