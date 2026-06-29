import { X, Award, MapPin, Clock, Globe, Briefcase } from "lucide-react";
import Image from "next/image";

export function StaffProfileModal({
  staff,
  onClose,
  onBook,
  onMessage
}: {
  staff: Record<string, any>;
  onClose: () => void;
  onBook?: () => void;
  onMessage?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-[var(--vx-jade)]/20 to-[var(--vx-sapphire)]/20" />
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          {/* Profile Photo */}
          <div className="absolute -bottom-16 left-8 rounded-full border-4 border-card bg-muted h-32 w-32 overflow-hidden shadow-lg">
            {staff.staff_profiles?.profile_photo ? (
              <Image 
                src={staff.staff_profiles.profile_photo} 
                alt={staff.full_name} 
                fill 
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-display bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
                {staff.full_name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pt-20 pb-8 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-medium">{staff.full_name}</h2>
              <p className="text-[var(--vx-coral)] font-medium mt-1">
                {staff.role} {staff.staff_profiles?.credentials ? `• ${staff.staff_profiles.credentials}` : ""}
              </p>
              {staff.staff_profiles?.specialization && (
                <p className="text-muted-foreground text-sm mt-1">{staff.staff_profiles.specialization}</p>
              )}
            </div>
            <div className="flex gap-2">
              {onMessage && staff.staff_profiles?.accepts_messages && (
                <button onClick={onMessage} className="btn btn-outline">Message</button>
              )}
              {onBook && staff.staff_profiles?.booking_enabled && (
                <button onClick={onBook} className="btn btn-primary">Book Session</button>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm">
            {/* Bio */}
            {staff.staff_profiles?.bio && (
              <section>
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-muted-foreground"/> About
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {staff.staff_profiles.bio}
                </p>
              </section>
            )}

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl">
              {staff.staff_profiles?.years_experience && (
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">Experience</div>
                  <div className="font-medium flex items-center gap-2">
                    <Award size={14} className="text-[var(--vx-jade)]"/> {staff.staff_profiles.years_experience} Years
                  </div>
                </div>
              )}
              {staff.staff_profiles?.languages && (
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">Languages</div>
                  <div className="font-medium flex items-center gap-2">
                    <Globe size={14} className="text-[var(--vx-sapphire)]"/> {staff.staff_profiles.languages}
                  </div>
                </div>
              )}
              {staff.staff_profiles?.timezone && (
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">Timezone</div>
                  <div className="font-medium flex items-center gap-2">
                    <Clock size={14} className="text-[var(--vx-coral)]"/> {staff.staff_profiles.timezone}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
