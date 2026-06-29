"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { Bell, AlertCircle, Calendar, MessageSquare, CheckCircle2, FlaskConical, FileText, UserPlus, FileSignature, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export function NotificationHistory() {
  const supabase = createClient();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    
    if (filter === "unread") {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;
    if (!error && data) {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  }, [filter, supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all" }),
    });
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_one", notificationId: n.id }),
      });
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("appointment")) return <Calendar size={20} className="text-amber-500" />;
    if (type.includes("message")) return <MessageSquare size={20} className="text-blue-500" />;
    if (type.includes("lab")) return <FlaskConical size={20} className="text-purple-500" />;
    if (type.includes("document")) return <FileText size={20} className="text-gray-500" />;
    if (type.includes("consent")) return <FileSignature size={20} className="text-red-500" />;
    if (type.includes("care_team")) return <UserPlus size={20} className="text-[var(--vx-jade)]" />;
    if (type.includes("success") || type.includes("payment") || type.includes("renewed")) return <CheckCircle2 size={20} className="text-[var(--vx-jade)]" />;
    return <AlertCircle size={20} className="text-[var(--vx-coral)]" />;
  };

  // Group notifications by date
  const grouped = notifications.reduce((acc, notif) => {
    const dateStr = format(new Date(notif.created_at), 'MMMM d, yyyy');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="notification-history">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Notifications</h1>
          <p className="mt-2 text-muted-foreground">View your recent alerts, messages, and updates.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead} 
            className="btn btn-outline text-xs h-9 flex items-center gap-2"
            disabled={notifications.filter(n => !n.is_read).length === 0}
          >
            <Check size={14} /> Mark all read
          </button>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <button 
          onClick={() => setFilter("all")} 
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${filter === "all" ? "border-[var(--vx-jade)] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          All Notifications
        </button>
        <button 
          onClick={() => setFilter("unread")} 
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${filter === "unread" ? "border-[var(--vx-jade)] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Unread
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-muted-foreground text-sm animate-pulse">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-white/5">
          <div className="w-48 h-48 mb-6 relative opacity-80">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--vx-sapphire)]/20 to-[var(--vx-jade)]/20 rounded-full blur-2xl" />
            <div className="w-full h-full bg-white/5 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <Bell className="text-muted-foreground w-12 h-12" />
            </div>
          </div>
          <h3 className="font-display text-2xl font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            When you have new alerts, messages, or updates, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, notifs]) => (
            <div key={date}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
                {date}
              </h2>
              <div className="vx-card divide-y divide-border overflow-hidden">
                {notifs.map(n => (
                  <button 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left flex gap-4 p-4 transition-colors hover:bg-muted/30 ${!n.is_read ? 'bg-muted/10' : ''}`}
                  >
                    <div className="mt-1 shrink-0 bg-background rounded-full p-2 border border-border shadow-sm">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className={`text-base truncate ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                          {n.title}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${!n.is_read ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                        {n.message}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--vx-coral)] mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
