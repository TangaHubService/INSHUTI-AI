"use client";

import type { ConversationSummary } from "@/lib/apiClient";
import type { UserProfile } from "@/lib/userApiClient";

interface ChatSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  conversations: ConversationSummary[];
  user: UserProfile | null;
  search: string;
  onSearchChange: (value: string) => void;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
}

function groupConversations(convs: ConversationSummary[]) {
  const today: ConversationSummary[] = [];
  const yesterday: ConversationSummary[] = [];
  const thisWeek: ConversationSummary[] = [];
  const thisMonth: ConversationSummary[] = [];
  const older: ConversationSummary[] = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);
  const monthStart = new Date(todayStart.getTime() - 30 * 86400000);
  for (const c of convs) {
    const d = new Date(c.createdAt);
    if (d >= todayStart) today.push(c);
    else if (d >= yesterdayStart) yesterday.push(c);
    else if (d >= weekStart) thisWeek.push(c);
    else if (d >= monthStart) thisMonth.push(c);
    else older.push(c);
  }
  return { today, yesterday, thisWeek, thisMonth, older };
}

const sectionLabels: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "Previous 7 days",
  thisMonth: "Previous 30 days",
  older: "Older",
};

export function ChatSidebar({
  collapsed,
  onToggle,
  conversations,
  user,
  search,
  onSearchChange,
  onNewChat,
  onLoadConversation,
}: ChatSidebarProps) {
  const filtered = search
    ? conversations.filter((c) =>
        (c.firstUserMessage || "").toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;
  const groups = groupConversations(filtered);
  const entries: [string, ConversationSummary[]][] = [
    ["today", groups.today],
    ["yesterday", groups.yesterday],
    ["thisWeek", groups.thisWeek],
    ["thisMonth", groups.thisMonth],
    ["older", groups.older],
  ];

  if (collapsed) {
    return (
      <aside className="flex h-screen w-[60px] shrink-0 flex-col items-center border-r border-[#E5E5E5] bg-white py-3 dark:border-[#333] dark:bg-[#171717]">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#666] transition hover:bg-[#F0F0F0] dark:text-[#8E8EA0] dark:hover:bg-[#2F2F2F]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-[#666] transition hover:bg-[#F0F0F0] dark:text-[#8E8EA0] dark:hover:bg-[#2F2F2F]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E5E5] text-[11px] font-bold text-[#666] dark:bg-[#2F2F2F] dark:text-[#8E8EA0]">
            {user ? user.name.charAt(0).toUpperCase() : "I"}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E5E5] bg-white dark:border-[#333] dark:bg-[#171717]">
      {/* Top: New chat + collapse */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex flex-1 items-center gap-3 rounded-lg border border-[#E5E5E5] px-3 py-2.5 text-sm text-[#333] transition hover:bg-[#F5F5F5] dark:border-[#4D4D4F] dark:text-[#ECECF1] dark:hover:bg-[#2F2F2F]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#666] transition hover:bg-[#F0F0F0] dark:text-[#8E8EA0] dark:hover:bg-[#2F2F2F]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 5L6 9l5 4M18 5l-5 4 5 4" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <svg width="14" height="14" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8EA0]">
            <use href="#i-search" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-lg bg-[#F5F5F5] py-2 pl-9 pr-3 text-[13px] text-[#333] placeholder:text-[#8E8EA0] outline-none transition focus:ring-1 focus:ring-[#D0D0D0] dark:bg-[#2F2F2F] dark:text-[#ECECF1] dark:focus:ring-[#4D4D4F]"
          />
        </div>
      </div>

      {/* Conversations */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 no-scrollbar">
        {filtered.length === 0 ? (
          <p className="px-3 pt-6 text-center text-[13px] text-[#8E8EA0]">
            {search ? "No matching conversations" : "No conversations yet"}
          </p>
        ) : (
          entries.map(([key, convs]) =>
            convs.length > 0 ? (
              <div key={key} className="mb-2">
                <div className="px-3 pb-1 text-[11px] font-medium text-[#8E8EA0]">
                  {sectionLabels[key]}
                </div>
                {convs.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => onLoadConversation(conv.id)}
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-[#333] transition hover:bg-[#F5F5F5] dark:text-[#ECECF1] dark:hover:bg-[#2F2F2F]"
                  >
                    <svg width="14" height="14" className="shrink-0 text-[#8E8EA0]">
                      <use href="#i-chat" />
                    </svg>
                    <span className="line-clamp-1 flex-1">
                      {conv.firstUserMessage || "Conversation"}
                    </span>
                  </button>
                ))}
              </div>
            ) : null,
          )
        )}
      </nav>

      {/* User */}
      <div className="border-t border-[#E5E5E5] px-2 py-2 dark:border-[#4D4D4F]">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-[#F5F5F5] dark:hover:bg-[#2F2F2F]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E5E5] text-[11px] font-bold text-[#666] dark:bg-[#2F2F2F] dark:text-[#8E8EA0]">
            {user ? user.name.charAt(0).toUpperCase() : "I"}
          </div>
          <span className="flex-1 truncate text-[13px] text-[#333] dark:text-[#ECECF1]">
            {user ? user.name : "Inshuti User"}
          </span>
          <div className="h-2 w-2 rounded-full bg-[#10A37F]" />
        </div>
      </div>
    </aside>
  );
}
