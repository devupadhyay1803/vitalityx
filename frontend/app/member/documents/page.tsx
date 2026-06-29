"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { DocumentCard, type DocumentType } from "@/components/documents/DocumentCard";
import { Search, LayoutGrid, List } from "lucide-react";

const CATEGORIES = ["All", "Lab Report", "Genetics Report", "Protocol", "Invoice", "Membership", "Consent", "Medical Form", "Other"];

export default function MemberDocumentsPage() {
  const supabase = createClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: documents, isLoading } = useSWR("member-documents", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  });

  const filteredDocs = (documents || []).filter((doc: DocumentType) => {
    const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="member-documents-page">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl font-medium">My Documents</h1>
          <p className="mt-2 text-muted-foreground">Securely access your labs, protocols, and medical records.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vx-input pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors border ${activeCategory === cat ? "bg-[var(--vx-jade)] text-black border-[var(--vx-jade)]" : "border-white/10 text-muted-foreground hover:bg-white/5"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      ) : (
        <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredDocs.map((doc: DocumentType) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
