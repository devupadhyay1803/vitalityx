"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { DocumentCard, type DocumentType } from "@/components/documents/DocumentCard";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { useUser } from "@/components/portal/user-provider";
import { Search, LayoutGrid, List, Plus } from "lucide-react";

const CATEGORIES = ["All", "Lab Report", "Genetics Report", "Protocol", "Invoice", "Membership", "Consent", "Medical Form", "Other"];

export default function MemberDocumentsPage() {
 const supabase = createClient();
 const { user } = useUser();
 const [activeCategory, setActiveCategory] = useState("All");
 const [search, setSearch] = useState("");
 const [viewMode, setViewMode] = useState<"list" | "grid">("list");
 const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
 const [showUpload, setShowUpload] = useState(false);
 const [replaceDoc, setReplaceDoc] = useState<{ id: string; path: string } | null>(null);

 const { data: documents, isLoading, mutate } = useSWR("member-documents", async () => {
 try {
 const { data: { user: currentUser } } = await supabase.auth.getUser();
 if (!currentUser) return [];
 
 const { data, error } = await supabase
 .from("documents")
 .select("*")
 .eq("member_id", currentUser.id);
 
 if (error) {
 console.warn("Error loading member documents:", error);
 return [];
 }
 return data;
 } catch (e) {
 console.warn("Failed to fetch member documents:", e);
 return [];
 }
 });

 const filteredDocs = (documents || []).filter((doc: DocumentType) => {
 const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
 const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
 doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
 (doc.description || "").toLowerCase().includes(search.toLowerCase());
 return matchesCategory && matchesSearch;
 }).sort((a: DocumentType, b: DocumentType) => {
 const da = new Date(a.created_at || 0).getTime();
 const db = new Date(b.created_at || 0).getTime();
 return sortBy === "newest" ? db - da : da - db;
 });

 return (
 <div className="mx-auto max-w-5xl px-6 py-10" data-testid="member-documents-page">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
 <div>
 <h1 className="font-display text-4xl font-medium">My Documents</h1>
 <p className="mt-2 text-muted-foreground">Securely access your labs, protocols, and medical records.</p>
 </div>
 
 <div className="flex flex-wrap items-center gap-2">
 {!showUpload && !replaceDoc && (
 <button 
 onClick={() => setShowUpload(true)} 
 className="btn btn-primary flex items-center gap-2 mr-2"
 >
 <Plus size={16} /> Upload
 </button>
 )}
 
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
 <input 
 type="text" 
 placeholder="Search..." 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="vx-input pl-10 w-full sm:w-48"
 />
 </div>
 
 <select 
 value={sortBy} 
 onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
 className="vx-input appearance-none w-32 hidden sm:block"
 >
 <option value="newest">Newest First</option>
 <option value="oldest">Oldest First</option>
 </select>

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

 {(showUpload || replaceDoc) && (
 <div className="mb-10 relative">
 <button 
 onClick={() => { setShowUpload(false); setReplaceDoc(null); }} 
 className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center vx-card rounded-full hover:bg-muted z-10"
 >
 ✕
 </button>
 <DocumentUpload 
 memberId={user?.id || ""} 
 onUploadSuccess={() => { setShowUpload(false); setReplaceDoc(null); mutate(); }} 
 replaceDocId={replaceDoc?.id}
 replaceDocPath={replaceDoc?.path}
 />
 </div>
 )}

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
 <p className="text-muted-foreground">No documents match your filters.</p>
 {(search || activeCategory !== "All") && (
 <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-2 text-sm text-[var(--vx-ink)] hover:underline">
 Clear filters
 </button>
 )}
 </div>
 ) : (
 <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
 {filteredDocs.map((doc: DocumentType) => (
 <DocumentCard 
 key={doc.id} 
 document={doc} 
 onDelete={() => mutate()}
 onReplace={() => { setReplaceDoc({ id: doc.id, path: doc.storage_path }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
 />
 ))}
 </div>
 )}
 </div>
 );
}
