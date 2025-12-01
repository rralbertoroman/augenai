"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ClipboardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

export function Clipboard({ className, children, ...props }: ClipboardProps) {
  return (
    <div
      className={cn("relative w-full", className)}
      {...props}
    >
      {/* Metal clip on top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center">
        <div className="relative w-48">
          {/* Top curved part - centered and wider */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-24 h-6 rounded-t-full" 
            style={{ 
              background: "linear-gradient(180deg, rgb(203, 213, 225) 0%, rgb(148, 163, 184) 100%)",
              boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.2)'
            }} 
          />
          {/* Bottom rectangular part - wider */}
          <div 
            className="w-48 h-5 mt-4" 
            style={{ 
              background: "linear-gradient(90deg, rgb(148, 163, 184) 0%, rgb(100, 116, 139) 50%, rgb(148, 163, 184) 100%)",
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 3px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '0.25rem'
            }} 
          />
          {/* Left screw hole */}
          <div className="absolute top-5 left-8 w-3 h-3 bg-slate-500 rounded-full shadow-md z-20" 
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.3)' }}
          />
          {/* Right screw hole */}
          <div className="absolute top-5 right-8 w-3 h-3 bg-slate-500 rounded-full shadow-md z-20" 
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.3)' }}
          />
        </div>
      </div>

      {/* Emerald clipboard border */}
      <div 
        className="relative rounded-3xl p-5"
        style={{
          background: "linear-gradient(to bottom right, rgb(167, 243, 208), rgb(110, 231, 183), rgb(52, 211, 153))",
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08), 0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.02)',
        }}
      >
        {/* Paper/content area - white background */}
        <div className="relative bg-white dark:bg-slate-50 rounded-2xl shadow-lg overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
