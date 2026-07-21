"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Drawer } from "./Drawer";
import {
  getCurrentUser,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/userApiClient";

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week(s) ago`;
}

export function NotificationBell() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCurrentUser().then((user) => {
      if (cancelled) return;
      setVisible(!!user);
      if (user) void refresh();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silent — the bell just shows nothing new rather than surfacing an error toast.
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    await refresh();
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    await refresh();
  }

  if (!visible) return null;

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          void refresh();
        }}
        title="Notifications"
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line bg-white"
      >
        <svg width="16" height="16" className="text-teal-700">
          <use href="#i-bell" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notifications">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/notifications" className="text-[13px] font-semibold text-teal-700" onClick={() => setOpen(false)}>
            Manage preferences
          </Link>
          {unreadCount > 0 && (
            <button onClick={() => void handleMarkAll()} className="text-[13px] font-semibold text-ink-soft hover:text-teal-700">
              Mark all read
            </button>
          )}
        </div>

        {!loading && notifications.length === 0 && <p className="text-sm text-ink-soft">No notifications yet.</p>}

        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && void handleMarkOne(n.id)}
              className={`rounded-md border px-4 py-3 text-left text-[13.5px] transition ${
                n.read ? "border-line bg-white" : "border-teal-100 bg-teal-100/40 hover:bg-teal-100/60"
              }`}
            >
              <div className="font-semibold text-ink">{n.title}</div>
              <div className="mt-1 text-ink-soft">{n.body}</div>
              <div className="mt-1.5 text-[11px] text-ink-soft">{relativeTime(n.createdAt)}</div>
            </button>
          ))}
        </div>
      </Drawer>
    </>
  );
}
