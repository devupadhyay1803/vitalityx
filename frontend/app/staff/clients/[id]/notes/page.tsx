"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ClientTabs } from "@/components/staff/client-tabs";
import { Lock, Trash2, Plus } from "lucide-react";
import { logClientAudit } from "@/lib/audit-client";

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
  
  const privateNotes = record?.intake?.private_notes || [];

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
    
    await logClientAudit("Note created", {
      targetUserId: id,
      resourceType: "note",
      resourceId: note.id,
      metadata: { length: newNote.length }
    });
    
    toast.success("Note added");
    setNewNote("");
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

    await logClientAudit("Note updated", {
      targetUserId: id,
      resourceType: "note",
      resourceId: noteId,
      metadata: { status: "deleted" }
    });

    mutate();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-client-notes">
      <h1 className="font-display text-4xl font-medium">Notes</h1>
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

      </div>
    </div>
  );
}
