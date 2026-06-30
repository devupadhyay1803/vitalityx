"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, Calendar, MessageSquare, CheckCircle2, FlaskConical, FileText, UserPlus, FileSignature } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/components/portal/user-provider";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationsPopover({ variant }: { variant: "member" | "staff" }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();
  const router = useRouter();
  const { user } = useUser();

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    };
    fetchNotifications();
  }, [supabase, user]);

  // Subscribe to Realtime updates
  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const setupRealtime = () => {
      // Append random string to channel name to prevent StrictMode cache collisions
      channel = supabase.channel(`notifications_${user.id}_${Math.random().toString(36).substring(7)}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n));
          }
        )
        .subscribe();
    };
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all" }),
    });
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      // Optimistic update
      setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_one", notificationId: n.id }),
      });
    }
    setOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("appointment")) return <Calendar size={16} className="text-amber-500" />;
    if (type.includes("message")) return <MessageSquare size={16} className="text-blue-500" />;
    if (type.includes("lab")) return <FlaskConical size={16} className="text-purple-500" />;
    if (type.includes("document")) return <FileText size={16} className="text-gray-500" />;
    if (type.includes("consent")) return <FileSignature size={16} className="text-red-500" />;
    if (type.includes("care_team")) return <UserPlus size={16} className="text-[var(--vx-jade)]" />;
    if (type.includes("success") || type.includes("payment") || type.includes("renewed")) return <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />;
    return <AlertCircle size={16} className="text-coral-500" />;
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setOpen(!open)} 
        className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left transition"
      >
        <div className="relative">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--vx-coral)] text-[8px] font-bold text-white shadow-sm ring-2 ring-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="md:hidden">Notifications</span>
        <span className="hidden md:inline">Notifications</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden md:bottom-auto md:left-full md:top-0 md:ml-2 md:w-80">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="font-display font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[var(--vx-jade)] hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((n) => (
              <button 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left flex gap-3 border-b border-border p-4 transition hover:bg-muted/30 ${!n.is_read ? "bg-muted/10" : ""}`}
              >
                <div className="mt-0.5 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                    {n.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {n.message}
                  </p>
                  <span className="mt-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                </div>
                {!n.is_read && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--vx-coral)] mt-1.5" />
                )}
              </button>
            ))}
            
            {notifications.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                <Bell size={24} className="text-muted-foreground opacity-50" />
                <p>You&apos;re all caught up!</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-border bg-muted/20 p-2">
            <button 
              onClick={() => {
                setOpen(false);
                router.push(`/${variant}/notifications`);
              }}
              className="w-full rounded-md py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              View all history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
