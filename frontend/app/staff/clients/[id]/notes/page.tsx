"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ClientTabs } from "@/components/staff/client-tabs";
import { Lock, FileText, Trash2, Plus } from "lucide-react";

const supabase = createClient();

export default function NotesDocsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Using SWR to load client record (where we will store the notes in a private_notes JSON array)
  const { data: record, mutate } = useSWR(`client-notes-${id}`, async () => {
    const { data } = await supabase.from("client_records").select("*").eq("member_id", id).single();
    return data;
  });

  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const privateNotes = record?.intake?.private_notes || [];
  const clinicalDocs = record?.intake?.clinical_docs || [];

  async function addNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const note = {
      id: crypto.randomUUID(),
      content: newNote,
      author: user?.id,
      created_at: new Date().toISOString()
    };

    const currentIntake = record?.intake || {};
    const updatedNotes = [note, ...privateNotes];

    const { error } = await supabase.from("client_records").update({
      intake: {
        ...currentIntake,
        private_notes: updatedNotes
      }
    }).eq("member_id", id);

    setAddingNote(false);
    if (error) return toast.error(error.message);
    
    toast.success("Note added");
    setNewNote("");
    mutate();
  }

  async function uploadDoc() {
    if (!file) return;
    setUploadingDoc(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Upload to storage
    const path = `docs/${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("lab-pdfs").upload(path, file); // Reusing lab-pdfs bucket for simplicity
    
    if (upErr) {
      setUploadingDoc(false);
      return toast.error(upErr.message);
    }
    
    const { data: pub } = supabase.storage.from("lab-pdfs").getPublicUrl(path);
    
    const doc = {
      id: crypto.randomUUID(),
      name: file.name,
      url: pub.publicUrl,
      author: user?.id,
      created_at: new Date().toISOString()
    };

    const currentIntake = record?.intake || {};
    const updatedDocs = [doc, ...clinicalDocs];

    const { error } = await supabase.from("client_records").update({
      intake: {
        ...currentIntake,
        clinical_docs: updatedDocs
      }
    }).eq("member_id", id);

    setUploadingDoc(false);
    if (error) return toast.error(error.message);
    
    toast.success("Document uploaded");
    setFile(null);
    mutate();
  }

  async function deleteNote(noteId: string) {
    const currentIntake = record?.intake || {};
    const updatedNotes = privateNotes.filter((n: any) => n.id !== noteId);

    const { error } = await supabase.from("client_records").update({
      intake: {
        ...currentIntake,
        private_notes: updatedNotes
      }
    }).eq("member_id", id);

    if (error) return toast.error(error.message);
    mutate();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-client-notes">
      <h1 className="font-display text-4xl font-medium">Notes & Docs</h1>
      <ClientTabs id={id} />

      <div className="grid md:grid-cols-2 gap-10 mt-8">
        
        {/* Private Notes */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-xl">Private Staff Notes</h2>
            <span className="badge badge-amber flex items-center gap-1"><Lock size={12} /> Internal Only</span>
          </div>
          
          <div className="vx-card p-5 mb-6">
            <textarea 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a clinical observation or operational note..."
              className="vx-input min-h-[100px] mb-3"
            />
            <button onClick={addNote} disabled={addingNote || !newNote.trim()} className="btn btn-primary w-full flex justify-center items-center gap-2">
              <Plus size={16} /> {addingNote ? "Saving..." : "Add Note"}
            </button>
          </div>

          <div className="space-y-4">
            {privateNotes.map((note: any) => (
              <div key={note.id} className="vx-card p-4 bg-muted/20 border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                  <button onClick={() => deleteNote(note.id)} className="text-muted-foreground hover:text-red-500 transition"><Trash2 size={14} /></button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
            {privateNotes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
          </div>
        </div>

        {/* Clinical Docs */}
        <div>
           <h2 className="font-display text-xl mb-6">Clinical Documents</h2>
           
           <div className="vx-card p-5 mb-6">
             <label className="block text-sm font-medium mb-2">Upload File (PDF/Image)</label>
             <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm mb-4" />
             <button onClick={uploadDoc} disabled={uploadingDoc || !file} className="btn btn-outline w-full flex justify-center items-center gap-2">
               <Upload size={16} /> {uploadingDoc ? "Uploading..." : "Upload Document"}
             </button>
           </div>

           <div className="space-y-3">
             {clinicalDocs.map((doc: any) => (
               <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center justify-between vx-card p-4 hover:border-[var(--vx-jade)] transition cursor-pointer group">
                 <div className="flex items-center gap-3">
                   <FileText size={20} className="text-[var(--vx-jade)]" />
                   <div>
                     <p className="text-sm font-medium group-hover:underline">{doc.name}</p>
                     <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                   </div>
                 </div>
               </a>
             ))}
             {clinicalDocs.length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
           </div>
        </div>

      </div>
    </div>
  );
}
