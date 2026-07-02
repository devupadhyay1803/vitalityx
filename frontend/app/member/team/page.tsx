"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { StaffProfileModal } from "@/components/member/StaffProfileModal";
import { BookingModal } from "@/components/portal/BookingModal";
import { MessageCircle, Calendar, ChevronRight, PhoneCall } from "lucide-react";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";
import { Users as UsersIcon } from "lucide-react";

export default function MemberCareTeamPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [selectedStaff, setSelectedStaff] = useState<Record<string, any> | null>(null);
  const [bookingCoachId, setBookingCoachId] = useState<string | null>(null);
  
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const { data: assignments, isLoading } = useSWR("care-team-assignments", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("care_team_assignments")
      .select(`
        id, role, is_primary,
        staff:profiles!care_team_assignments_staff_id_fkey(
          id, full_name, email, role,
          staff_profiles(*)
        )
      `)
      .eq("member_id", user.id)
      .order("is_primary", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  });

  const uniqueAssignments = (assignments || []).reduce((acc: any[], current: any) => {
    const staffId = current.staff?.id;
    if (staffId && !acc.find((item: any) => item.staff?.id === staffId)) {
      acc.push(current);
    } else if (!staffId) {
      acc.push(current);
    }
    return acc;
  }, []);

  const roles = Array.from(new Set(uniqueAssignments.map((a: any) => a.role)));

  const filteredTeam = uniqueAssignments.filter((a: any) => {
    const p = a.staff || {};
    const matchesSearch = !q || (p.full_name || "").toLowerCase().includes(q.toLowerCase());
    const matchesRole = filterRole === "All" || a.role === filterRole;
    return matchesSearch && matchesRole;
  });

  async function handleBook(bookingData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error, data: newApt } = await supabase.from("appointments").insert({
      member_id: user!.id,
      staff_id: bookingData.staff_id,
      title: bookingData.title,
      session_type: bookingData.session_type,
      scheduled_start: bookingData.scheduled_start,
      scheduled_end: bookingData.scheduled_end,
      status: "Scheduled",
    }).select().single();

    if (!error && newApt) {
      fetch("/api/appointments", { method: "POST", body: JSON.stringify({ action: "booked", appointmentId: newApt.id }) });
    }
    setBookingCoachId(null);
    router.push("/member/sessions");
  }

  function handleMessage(staffId: string) {
    router.push(`/member/messages?staffId=${staffId}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="member-care-team-page">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-display text-4xl font-medium tracking-tight">My Care Team</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl text-lg">
          Meet the specialists supporting your longevity journey. Your care team is dedicated to 
          helping you achieve your personal health goals.
        </p>
      </div>
      
      {uniqueAssignments.length > 0 && (
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search team members…" 
              className="w-full bg-muted/30 border border-border/50 rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm" 
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 text-muted-foreground"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full sm:w-56 appearance-none bg-muted/30 border border-border/50 rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--vx-jade)] transition-all shadow-sm font-medium"
            >
              <option value="All">All Roles</option>
              {roles.map((r: any) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted/50 rounded-[24px] animate-pulse" />
          ))}
        </div>
      ) : uniqueAssignments.length === 0 ? (
        <ModernEmptyState 
          icon={<PhoneCall size={32} />}
          title="Care Team Not Assigned"
          description="Your care team will appear here once your onboarding has been reviewed by our medical staff."
          actionLabel="Contact Support"
          actionHref="mailto:support@vitalityx.example.com"
        />
      ) : filteredTeam.length === 0 ? (
        <ModernEmptyState 
          icon={<UsersIcon size={32} />}
          title="No team members match"
          description="Try adjusting your filters or search query."
          actionLabel="Clear filters"
          onAction={() => { setQ(""); setFilterRole("All"); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((assignment: any) => {
            const staff = assignment.staff;
            if (!staff) {
              return (
                <PremiumCard key={assignment.id} className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-medium text-muted-foreground mb-4">
                    ?
                  </div>
                  <h3 className="font-display text-xl font-medium text-muted-foreground">Unavailable</h3>
                  <p className="text-sm text-muted-foreground">{assignment.role}</p>
                </PremiumCard>
              );
            }
            const profile = staff.staff_profiles?.[0] || {};
            const combinedStaff = { ...staff, staff_profiles: profile };

            return (
              <PremiumCard 
                key={assignment.id} 
                className="group flex flex-col p-0 overflow-hidden"
              >
                <div className="relative h-24 bg-gradient-to-r from-muted to-muted/50">
                  {assignment.is_primary && (
                    <div className="absolute top-4 right-4">
                      <StatusBadge status="neutral" label="Primary Care Lead" className="bg-[var(--vx-coral)] text-white border-transparent" />
                    </div>
                  )}
                </div>

                <div className="px-6 flex-1 flex flex-col">
                  <div className="-mt-12 mb-4 w-24 h-24 rounded-full border-4 border-card bg-muted overflow-hidden relative shadow-md shrink-0">
                    {profile.profile_photo ? (
                      <Image 
                        src={profile.profile_photo} 
                        alt={staff.full_name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-display bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                        {staff.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-medium">{staff.full_name}</h3>
                    <p className="text-sm font-medium text-[var(--vx-sapphire)] mt-0.5">
                      {assignment.role} {profile.credentials ? `• ${profile.credentials}` : ""}
                    </p>
                    {profile.specialization && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{profile.specialization}</p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted-foreground">
                    {profile.years_experience && <span>{profile.years_experience} Yrs Exp</span>}
                    {profile.languages && <span>{profile.languages}</span>}
                  </div>

                  <div className="flex-1 min-h-[1.5rem]" />

                  <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-2 pb-6">
                    <button 
                      onClick={() => setSelectedStaff(combinedStaff)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-muted/50 transition-colors text-left"
                    >
                      View Full Profile
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={() => profile.accepts_messages ? handleMessage(staff.id) : null}
                        disabled={!profile.accepts_messages}
                        className="btn btn-outline flex items-center justify-center gap-2 text-xs py-2 shadow-sm"
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                      
                      <button 
                        onClick={() => profile.booking_enabled ? setBookingCoachId(staff.id) : null}
                        disabled={!profile.booking_enabled}
                        className="btn btn-primary flex items-center justify-center gap-2 text-xs py-2 shadow-sm"
                      >
                        <Calendar size={14} /> Book
                      </button>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      )}

      {selectedStaff && (
        <StaffProfileModal 
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onBook={selectedStaff.staff_profiles?.booking_enabled ? () => {
            setSelectedStaff(null);
            setBookingCoachId(selectedStaff.id);
          } : undefined}
          onMessage={selectedStaff.staff_profiles?.accepts_messages ? () => {
            handleMessage(selectedStaff.id);
          } : undefined}
        />
      )}

      {bookingCoachId && (
        <BookingModal 
          preselectedCoachId={bookingCoachId}
          onClose={() => setBookingCoachId(null)}
          onBook={handleBook}
        />
      )}
    </div>
  );
}
