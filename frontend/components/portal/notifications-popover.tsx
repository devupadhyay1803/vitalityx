"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, Calendar, MessageSquare, CheckCircle2 } from "lucide-react";

type Notification = {
  id: string;
  type: "alert" | "reminder" | "message" | "success";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export function NotificationsPopover({ variant }: { variant: "member" | "staff" }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const [notifications, setNotifications] = useState<Notification[]>(
    variant === "member" 
    ? [
        { id: "1", type: "alert", title: "Action Required: Fasting", description: "Remember to fast for 12 hours prior to your 8AM blood draw tomorrow.", time: "2 hours ago", read: false },
        { id: "2", type: "reminder", title: "Daily Protocol", description: "It's time for your Evening Supplement Stack.", time: "4 hours ago", read: false },
        { id: "3", type: "success", title: "Labs Received", description: "Your latest multi-omics panel has been processed.", time: "1 day ago", read: true },
      ]
    : [
        { id: "1", type: "alert", title: "Critical Biomarker", description: "John Doe's ApoB levels require immediate review.", time: "10 mins ago", read: false },
        { id: "2", type: "message", title: "New Message", description: "Sarah Smith asked a question about her methylation stack.", time: "1 hour ago", read: false },
        { id: "3", type: "success", title: "Kit Delivered", description: "Welcome kit delivered to Michael Chen.", time: "2 hours ago", read: true },
      ]
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "alert": return <AlertCircle size={16} className="text-coral-500" />;
      case "reminder": return <Calendar size={16} className="text-amber-500" />;
      case "message": return <MessageSquare size={16} className="text-blue-500" />;
      case "success": return <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />;
      default: return <Bell size={16} />;
    }
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
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-coral-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-card">
              {unreadCount}
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
            {notifications.map((n) => (
              <div key={n.id} className={`flex gap-3 border-b border-border p-4 transition hover:bg-muted/30 ${!n.read ? "bg-muted/10" : ""}`}>
                <div className="mt-0.5 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm ${!n.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                    {n.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {n.description}
                  </p>
                  <span className="mt-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
                    {n.time}
                  </span>
                </div>
                {!n.read && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--vx-jade)] mt-1.5" />
                )}
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                You're all caught up!
              </div>
            )}
          </div>
          
          <div className="border-t border-border bg-muted/20 p-2">
            <button className="w-full rounded-md py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition">
              View all history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
