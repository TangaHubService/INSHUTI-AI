"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Language, ChatSource } from "@/lib/apiClient";
import { MessageActions } from "./MessageActions";
import { CodeBlock } from "./CodeBlock";
import { SuggestedActions } from "./SuggestedActions";
import { SourceCard } from "./SourceCard";

interface DisplayMessage {
  role: "user" | "bot";
  content: string;
  time: string;
  id?: string;
}

interface ChatMessageProps {
  message: DisplayMessage;
  index: number;
  isLast: boolean;
  language: Language;
  sources: ChatSource[];
  showSources: boolean;
  quickReplies: string[];
  sending: boolean;
  onSend: (text: string) => void;
  onRegenerate: () => void;
  onFeedback: (key: string, type: "helpful" | "not-helpful") => void;
  onSuggestedAction: (key: string) => void;
  onToggleSources: () => void;
  onShare: () => void;
}

export function ChatMessage({
  message,
  index,
  isLast,
  language,
  sources,
  showSources,
  quickReplies,
  sending,
  onSend,
  onRegenerate,
  onFeedback,
  onSuggestedAction,
  onToggleSources,
  onShare,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      className={`mb-6 ${isUser ? "flex flex-col items-end" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className={`flex items-start gap-4 w-full max-w-[768px] mx-auto ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        {isUser ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5436DA]">
            <span className="text-sm font-medium text-white">
              {message.content.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10A37F]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="4" y="7" width="16" height="12" rx="4" />
              <path d="M12 3v4M8 13h.01M16 13h.01" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className={`min-w-0 ${isUser ? "max-w-[80%]" : "max-w-[90%] sm:max-w-[92%]"}`}>
          {/* Message bubble */}
          <div
            className={`text-[15px] leading-[1.7] ${
              isUser
                ? "rounded-2xl rounded-br-[4px] bg-[#10A37F] px-4 py-2.5 text-white"
                : "text-[#333] dark:text-[#ECECF1]"
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="chat-msg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="last:mb-0">{children}</p>,
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      const codeText = String(children).replace(/\n$/, "");
                      if (isInline) {
                        return <code {...props}>{children}</code>;
                      }
                      const lang = (className ?? "").replace("language-", "");
                      return <CodeBlock language={lang || "text"} code={codeText} />;
                    },
                    pre: ({ children }) => <>{children}</>,
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer row */}
          <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : ""}`}>
            <span className="px-1 text-[11px] text-[#B0B0B0]">{message.time}</span>
            {!isUser && (
              <div className="opacity-0 transition group-hover:opacity-100 flex items-center gap-0.5">
                <MessageActions
                  content={message.content}
                  onRegenerate={isLast ? onRegenerate : undefined}
                  onFeedback={(type) => onFeedback(message.id ?? index.toString(), type)}
                  onShare={onShare}
                />
                {sources.length > 0 && isLast && (
                  <button
                    type="button"
                    onClick={onToggleSources}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#8E8EA0] transition hover:text-[#10A37F]"
                  >
                    <svg width="10" height="10">
                      <use href="#i-book" />
                    </svg>
                    {showSources ? "Hide" : `${sources.length} source(s)`}
                  </button>
                )}
              </div>
            )}
            {isUser && (index === 0 || !sending) && (
              <MessageActions content={message.content} />
            )}
          </div>

          {/* Sources */}
          {!isUser && showSources && sources.length > 0 && isLast && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8E8EA0]">
                Sources
              </div>
              <div className="flex flex-col gap-2">
                {sources.map((source, i) => (
                  <SourceCard key={source.id} source={source} language={language} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggested actions */}
          {!isUser && isLast && !sending && (
            <SuggestedActions language={language} onAction={onSuggestedAction} />
          )}

          {/* Quick replies */}
          {!isUser && quickReplies.length > 0 && isLast && (
            <motion.div
              className="mt-3 flex flex-wrap gap-1.5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => onSend(reply)}
                  className="rounded-full border border-[#10A37F] bg-white px-3 py-1.5 text-[12px] font-medium text-[#10A37F] transition hover:bg-[#F0FDF4] dark:border-[#10A37F] dark:bg-transparent dark:text-[#10A37F] dark:hover:bg-[#0A2E24]"
                >
                  {reply}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
