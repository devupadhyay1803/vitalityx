"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, FileText, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { logClientAudit } from "@/lib/audit-client";

const CATEGORIES = [
  "Lab Report",
  "Genetics Report",
  "Protocol",
  "Invoice",
  "Membership",
  "Consent",
  "Medical Form",
  "Other"
];

export function DocumentUpload({ memberId, onUploadSuccess, replaceDocId, replaceDocPath }: { memberId: string, onUploadSuccess: () => void, replaceDocId?: string, replaceDocPath?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB");
      return;
    }
    setFile(selectedFile);
    if (!title) setTitle(selectedFile.name.split('.')[0].replace(/[-_]/g, ' '));
  };

  const upload = async () => {
    if (!file || !title) return toast.error("File and Title are required");
    setIsUploading(true);
    setProgress(10);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // Upload to Storage
      let storagePath = replaceDocPath;
      if (!storagePath) {
        const ext = file.name.split('.').pop();
        storagePath = `${memberId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      }

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, { upsert: !!replaceDocPath });

      if (storageError) throw storageError;
      setProgress(60);

      // Save to DB
      if (replaceDocId) {
        const { error: dbError } = await supabase.from("documents").update({
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          updated_at: new Date().toISOString()
        }).eq("id", replaceDocId);
        
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase.from("documents").insert({
          member_id: memberId,
          uploaded_by: user.id,
          category,
          title,
          description,
          file_name: file.name,
          storage_path: storagePath,
          mime_type: file.type,
          file_size: file.size
        });
        
        if (dbError) throw dbError;
      }

      setProgress(100);
      
      await logClientAudit("Document uploaded", {
        targetUserId: memberId,
        resourceType: "document",
        metadata: { file_name: file.name, category }
      });

      toast.success(replaceDocId ? "Document replaced" : "Document uploaded successfully");
      
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      onUploadSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="vx-card p-6 border-dashed border-2">
      <h3 className="font-display text-xl mb-4">{replaceDocId ? "Replace Document" : "Upload New Document"}</h3>
      
      {!file ? (
        <div 
          className={`flex flex-col items-center justify-center py-10 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${isDragging ? "border-[var(--vx-jade)] bg-[var(--vx-jade)]/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
            className="hidden" 
          />
          <UploadCloud size={32} className="text-muted-foreground mb-3" />
          <p className="font-medium text-sm">Click or drag file to this area to upload</p>
          <p className="text-xs text-muted-foreground mt-1">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText size={20} className="text-[var(--vx-jade)] shrink-0" />
              <span className="text-sm truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <button onClick={() => setFile(null)} disabled={isUploading} className="p-1 hover:bg-white/10 rounded-full transition">
              <X size={16} />
            </button>
          </div>

          {!replaceDocId && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="vx-input" placeholder="Document Title" disabled={isUploading} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="vx-input" disabled={isUploading}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="vx-input min-h-[80px]" placeholder="Brief description of the document..." disabled={isUploading} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button onClick={upload} disabled={isUploading || !title} className="btn btn-primary flex-1 sm:flex-none flex justify-center items-center gap-2">
              {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading {progress}%</> : <><UploadCloud size={16} /> {replaceDocId ? "Replace File" : "Upload Document"}</>}
            </button>
            {isUploading && (
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--vx-jade)] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
