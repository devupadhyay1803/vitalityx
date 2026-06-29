"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { ClientTabs } from "@/components/staff/client-tabs";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { Search, Filter, Plus } from "lucide-react";

const CATEGORIES = ["All", "Lab Report", "Genetics Report", "Protocol", "Invoice", "Membership", "Consent", "Medical Form", "Other"];

export default function StaffDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [replaceDoc, setReplaceDoc] = useState<{id: string, path: string} | null>(null);

  const { data: documents, isLoading, mutate } = useSWR(`staff-documents-${id}`, async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("member_id", id)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  });

  const filteredDocs = (documents || []).filter((doc: Record<string, any>) => {
    const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-documents-page">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl font-medium">Documents</h1>
        {!showUpload && !replaceDoc && (
          <button onClick={() => setShowUpload(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Upload Document
          </button>
        )}
      </div>
      
      <ClientTabs id={id} />

      {(showUpload || replaceDoc) && (
        <div className="mb-10 relative">
          <button 
            onClick={() => { setShowUpload(false); setReplaceDoc(null); }} 
            className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-card border border-border rounded-full hover:bg-muted z-10"
          >
            ✕
          </button>
          <DocumentUpload 
            memberId={id} 
            onUploadSuccess={() => { setShowUpload(false); setReplaceDoc(null); mutate(); }} 
            replaceDocId={replaceDoc?.id}
            replaceDocPath={replaceDoc?.path}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={16} className="text-muted-foreground mr-2 shrink-0" />
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-colors border ${activeCategory === cat ? "bg-[var(--vx-jade)] text-black border-[var(--vx-jade)] font-medium" : "border-white/10 text-muted-foreground hover:bg-white/5"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vx-input pl-9 w-full sm:w-48 text-sm py-1.5 min-h-0 h-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <p className="text-muted-foreground">No documents found for this client.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredDocs.map((doc: Record<string, any>) => (
            <DocumentCard 
              key={doc.id} 
              document={doc} 
              isStaff 
              onDelete={() => mutate()} 
              onReplace={() => { setReplaceDoc({ id: doc.id, path: doc.storage_path }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
