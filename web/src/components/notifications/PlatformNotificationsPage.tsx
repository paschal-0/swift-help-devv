"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export type PlatformNotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type NotificationTab = {
  id: string;
  label: string;
};

type PlatformNotificationsPageProps<TNotification extends PlatformNotificationItem> = {
  tabs: NotificationTab[];
  loadNotifications: () => Promise<TNotification[]>;
  markRead: (notificationId: string) => Promise<TNotification>;
  getCategory: (notification: TNotification) => string;
  getTargetHref: (notification: TNotification, countryPrefix: string) => string | null;
  onBeforeNavigate?: (notification: TNotification) => void;
};

function formatTimeAgo(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getGroupLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfDate) / 86_400_000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function NotificationIcon({ category }: { category: string }) {
  const path =
    category === "earnings"
      ? "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm.75 13.75V18h-1.5v-1.21a3.45 3.45 0 0 1-2.47-1.28l1.13-1.02c.47.56 1.05.86 1.8.86.78 0 1.34-.34 1.34-.94 0-.55-.37-.82-1.56-1.14-1.69-.45-2.45-1.08-2.45-2.32 0-1.15.86-1.98 2.21-2.2V7.5h1.5v1.29c.86.18 1.56.58 2.08 1.18l-1.08 1.03a2.31 2.31 0 0 0-1.64-.72c-.72 0-1.17.3-1.17.8 0 .48.38.72 1.62 1.06 1.63.44 2.39 1.09 2.39 2.39 0 1.18-.88 2.02-2.2 2.22Z"
      : category === "requests"
        ? "M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H11l-4.3 3.58A1 1 0 0 1 5 17.81V15.5A2.5 2.5 0 0 1 2.5 13v-7.5H4Zm3 1.75v1.5h10v-1.5H7Zm0 3.5v1.5h6.5v-1.5H7Z"
        : category === "consultations"
          ? "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-3.2 2.4A.5.5 0 0 1 10 20v-2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4v2h10V8H7Zm0 4v2h7v-2H7Z"
          : category === "ai"
            ? "M12 3a7 7 0 0 0-4 12.74V18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 3Zm-2 18h4v-1.5h-4V21Zm-1-9.5a1.5 1.5 0 1 1 3 0v.5h1v-.5a1.5 1.5 0 1 1 3 0c0 .86-.72 1.5-1.5 1.5H13v1h2v1.5H9V14h2v-1H9.5C8.72 13 8 12.36 8 11.5Z"
            : "M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v3H2V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm15 9v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8h20Zm-5 3h-2v2h2v-2Zm-4 0h-2v2h2v-2Zm-4 0H7v2h2v-2Z";

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E3F2FD] text-[#1565C0] sm:h-[52px] sm:w-[52px]">
      <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden>
        <path fill="currentColor" d={path} />
      </svg>
    </span>
  );
}

export function PlatformNotificationsPage<TNotification extends PlatformNotificationItem>({
  tabs,
  loadNotifications,
  markRead,
  getCategory,
  getTargetHref,
  onBeforeNavigate,
}: PlatformNotificationsPageProps<TNotification>) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "all");
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const countryPrefix = pathname.match(/^\/[a-z]{2}(?=\/)/)?.[0] ?? "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await loadNotifications();
        if (cancelled) return;

        const sortedData = [...data].sort(
          (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        );
        setNotifications(sortedData);

        const unread = sortedData.filter((notification) => !notification.read);
        if (unread.length) {
          setNotifications((current) =>
            current.map((notification) => ({ ...notification, read: true })),
          );
          void Promise.allSettled(unread.map((notification) => markRead(notification.id)));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load notifications.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadNotifications, markRead]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((notification) => getCategory(notification) === activeTab);
  }, [activeTab, getCategory, notifications]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce<Array<{ label: string; items: TNotification[] }>>((groups, notification) => {
      const label = getGroupLabel(notification.createdAt);
      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.items.push(notification);
      } else {
        groups.push({ label, items: [notification] });
      }

      return groups;
    }, []);
  }, [filteredNotifications]);

  const handleNotificationClick = (notification: TNotification) => {
    const targetHref = getTargetHref(notification, countryPrefix);
    if (!targetHref) return;

    onBeforeNavigate?.(notification);
    router.push(targetHref);
  };

  const refreshNotifications = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await loadNotifications();
      setNotifications(
        [...data]
          .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
          .map((notification) => ({ ...notification, read: true })),
      );
      await Promise.allSettled(
        data.filter((notification) => !notification.read).map((notification) => markRead(notification.id)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to refresh notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-6 w-full text-[#334155] sm:mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.05em] sm:text-[30px]">
            Notifications
          </h1>
          <p className="mt-1 text-[13px] font-light leading-5 tracking-[-0.04em] text-[#64748B] sm:text-[15px]">
            Review account updates, booking activity, and care messages.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshNotifications}
          className="inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-[#1565C0] px-5 text-[13px] font-semibold tracking-[-0.03em] text-white shadow-[0_12px_26px_rgba(21,101,192,0.18)] transition hover:bg-[#0F5BAE] sm:w-auto"
        >
          Refresh
        </button>
      </div>

      <article className="mt-5 rounded-[18px] bg-[#F8FAFC] px-3 py-4 shadow-[0_16px_40px_rgba(148,163,184,0.12)] sm:mt-7 sm:rounded-[16px] sm:px-6 sm:py-6 xl:px-8 xl:py-8">
        <div className="flex gap-2 overflow-x-auto border-b border-[#D8E4F1] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 rounded-[12px] px-4 py-2 text-[14px] font-semibold tracking-[-0.04em] transition sm:px-2 sm:text-[18px] ${
                activeTab === tab.id
                  ? "text-[#1565C0]"
                  : "text-[#94A3B8] hover:bg-[#E3F2FD] hover:text-[#1565C0]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <span className="absolute inset-x-3 -bottom-[13px] h-[5px] rounded-full bg-[#1565C0] sm:inset-x-0 sm:-bottom-[17px]" />
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid min-h-[300px] place-items-center text-center">
            <p className="text-[14px] font-light tracking-[-0.04em] text-[#64748B]">
              Loading notifications...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="grid min-h-[300px] place-items-center rounded-[14px] border border-dashed border-[#B8C7D9] bg-white/55 p-6 text-center">
            <div>
              <p className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
                Notifications could not load
              </p>
              <p className="mt-2 text-[14px] font-light leading-5 tracking-[-0.04em] text-[#64748B]">
                {errorMessage}
              </p>
            </div>
          </div>
        ) : groupedNotifications.length ? (
          <div className="mt-5 space-y-7 sm:mt-7">
            {groupedNotifications.map((group) => (
              <section key={group.label}>
                <h2 className="px-1 text-[16px] font-semibold tracking-[-0.05em] text-[#94A3B8] sm:text-[18px]">
                  {group.label}
                </h2>
                <div className="mt-3 space-y-3 sm:mt-4">
                  {group.items.map((notification) => {
                    const category = getCategory(notification);
                    const targetHref = getTargetHref(notification, countryPrefix);

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        disabled={!targetHref}
                        className="group flex w-full min-w-0 items-start gap-3 rounded-[16px] border border-[#D8E4F1] bg-[#F8FAFC] px-3 py-4 text-left shadow-[0_10px_24px_rgba(148,163,184,0.08)] transition hover:-translate-y-0.5 hover:border-[#BBDDFB] hover:bg-white hover:shadow-[0_16px_34px_rgba(30,136,229,0.12)] disabled:cursor-default disabled:hover:translate-y-0 sm:items-center sm:gap-4 sm:px-5 sm:py-5"
                      >
                        <NotificationIcon category={category} />
                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-[16px] font-semibold leading-5 tracking-[-0.05em] text-[#334155] sm:text-[18px]">
                                {notification.title}
                              </span>
                              {!notification.read ? (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#1565C0]" />
                              ) : null}
                            </span>
                            <span className="shrink-0 text-[12px] font-medium tracking-[-0.04em] text-[#94A3B8] sm:text-[14px]">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </span>
                          {notification.message ? (
                            <span className="mt-1 line-clamp-2 block text-[13px] font-light leading-5 tracking-[-0.04em] text-[#64748B] sm:text-[15px]">
                              {notification.message}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[300px] place-items-center rounded-[14px] border border-dashed border-[#B8C7D9] bg-white/55 p-6 text-center">
            <div>
              <p className="text-[18px] font-semibold tracking-[-0.05em] text-[#334155]">
                No notifications yet
              </p>
              <p className="mt-2 max-w-[360px] text-[14px] font-light leading-5 tracking-[-0.04em] text-[#64748B]">
                New updates will appear here as soon as they are available.
              </p>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
