"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clipboard } from "./clipboard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ClipboardDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function ClipboardDialog({
  open,
  onOpenChange,
  trigger,
  title,
  children,
}: ClipboardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        customContent
        className="min-w-[50vw] max-w-4xl max-h-[90vh] p-0 bg-transparent shadow-none flex items-center justify-center transition:all ease-in-out duration-300"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Clipboard className="flex flex-col w-full h-full">
          <div className="px-6 pt-8 pb-0 shrink-0 relative">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8"
              onClick={() => onOpenChange?.(false)}
            >
              <X className="h-8 w-8" />
            </Button>
          </div>

          <div className="px-6 py-4 overflow-y-auto scrollbar-hide max-h-[77vh] min-h-0">
            {children}
          </div>
        </Clipboard>
      </DialogContent>
    </Dialog>
  );
}
