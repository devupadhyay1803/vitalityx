"use client";

import { useState } from "react";
import { FileText, FileImage, Download, Eye, Trash2, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

type DocumentCardProps = {
  document: Record<string, any>;
  isStaff?: boolean;
  onDelete?: () => void;
  onReplace?: () => void;
};

export function DocumentCard({ document, isStaff, onDelete, onReplace }: DocumentCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const isImage = document.mime_type.startsWith("image/");
  const isPdf = document.mime_type === "application/pdf";
  const canPreview = isImage || isPdf;

  async function getSignedUrl(download: boolean) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(document.storage_path, 60, {
        download: download ? document.file_name : undefined
      });
      if (error) throw error;
      return data.signedUrl;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate link");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    const url = await getSignedUrl(true);
    if (url) {
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  }

  async function handlePreview() {
    const url = await getSignedUrl(false);
    if (url) setPreviewUrl(url);
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsLoading(true);
    try {
      // Delete from storage first
      const { error: storageErr } = await supabase.storage.from("documents").remove([document.storage_path]);
      if (storageErr) throw storageErr;
      
      // Delete from DB
      const { error: dbErr } = await supabase.from("documents").delete().eq("id", document.id);
      if (dbErr) throw dbErr;
      
      toast.success("Document deleted");
      if (onDelete) onDelete();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsLoading(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  return (
    <>
      <div className="vx-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-[var(--vx-jade)] transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-3 bg-white/5 rounded-lg shrink-0 group-hover:text-[var(--vx-jade)] transition-colors">
            {isImage ? <FileImage size={24} /> : <FileText size={24} />}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium truncate" title={document.title}>{document.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="badge badge-amber shrink-0">{document.category}</span>
              <span className="truncate">{document.file_name}</span>
              <span>&bull;</span>
              <span className="shrink-0">{formatBytes(document.file_size)}</span>
              <span>&bull;</span>
              <span className="shrink-0">{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            {document.description && (
              <p className="mt-2 text-sm text-muted-foreground truncate" title={document.description}>{document.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto">
          {canPreview && (
            <button onClick={handlePreview} disabled={isLoading} className="btn btn-outline flex-1 sm:flex-none px-3 py-1.5 text-xs flex items-center justify-center gap-1.5" title="Preview">
              <Eye size={14} /> Preview
            </button>
          )}
          <button onClick={handleDownload} disabled={isLoading} className="btn btn-primary flex-1 sm:flex-none px-3 py-1.5 text-xs flex items-center justify-center gap-1.5" title="Download">
            <Download size={14} /> Download
          </button>
          
          {isStaff && (
            <>
              <button onClick={onReplace} disabled={isLoading} className="btn btn-outline px-3 py-1.5 text-xs flex items-center justify-center" title="Replace File">
                <RefreshCw size={14} />
              </button>
              <button onClick={handleDelete} disabled={isLoading} className="btn btn-outline text-destructive hover:bg-destructive/10 px-3 py-1.5 text-xs flex items-center justify-center" title="Delete">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {previewUrl && (
        <DocumentPreviewModal 
          url={previewUrl} 
          mimeType={document.mime_type} 
          onClose={() => setPreviewUrl(null)} 
        />
      )}
    </>
  );
}
