"use client";

import { X } from "lucide-react";
import Image from "next/image";

export function DocumentPreviewModal({ url, mimeType, onClose }: { url: string; mimeType: string; onClose: () => void }) {
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
      <div className="w-full h-full max-w-5xl max-h-[90vh] bg-card border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-4 border-b border-white/5 shrink-0">
          <h3 className="font-display text-xl">Document Preview</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/20">
          {isImage && (
            <div className="relative w-full h-full">
              <Image src={url} alt="Document Preview" fill className="object-contain rounded-lg" />
            </div>
          )}
          {isPdf && (
            <iframe src={`${url}#toolbar=0`} className="w-full h-full rounded-lg border-0" />
          )}
          {!isImage && !isPdf && (
            <div className="text-center">
              <p className="text-muted-foreground">Preview not available for this file type.</p>
              <a href={url} download className="btn btn-primary mt-4 inline-block">Download File</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
