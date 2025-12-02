"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clipboard } from "@/components/common/clipboard";

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

      <DialogContent className="max-w-2xl p-0 bg-transparent shadow-none [&>div]:bg-transparent [&>div]:shadow-none [&>div]:p-0">
        <Clipboard>
          <div className="px-6 pt-8 pb-0">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-6 py-4">{children}</div>
        </Clipboard>
      </DialogContent>
    </Dialog>
  );
}
