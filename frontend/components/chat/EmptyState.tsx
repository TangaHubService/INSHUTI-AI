"use client";

import { motion } from "framer-motion";
import type { ConversationSummary } from "@/lib/apiClient";

const HEALTH_TOPICS = [
  {
    icon: "i-droplet",
    color: "bg-coral-100 text-coral-dark",
    title: "Menstrual Health",
    questions: [
      "What is a normal menstrual cycle?",
      "How do I manage period pain?",
    ],
  },
  {
    icon: "i-heart",
    color: "bg-teal-100 text-teal-700",
    title: "Relationships",
    questions: [
      "What makes a healthy relationship?",
      "How do I handle peer pressure?",
    ],
  },
  {
    icon: "i-mind",
    color: "bg-gold-100 text-[#8A5E1E]",
    title: "Mental Wellbeing",
    questions: [
      "How do I cope with stress?",
      "What is anxiety and how to manage it?",
    ],
  },
  {
    icon: "i-shield",
    color: "bg-teal-100 text-teal-700",
    title: "Sexual Health",
    questions: [
      "What contraception options exist?",
      "How is HIV transmitted?",
    ],
  },
  {
    icon: "i-baby",
    color: "bg-gold-100 text-[#8A5E1E]",
    title: "Pregnancy",
    questions: [
      "What are early signs of pregnancy?",
      "What should I eat during pregnancy?",
    ],
  },
  {
    icon: "i-pill",
    color: "bg-coral-100 text-coral-dark",
    title: "Family Planning",
    questions: [
      "How does birth control work?",
      "What is emergency contraception?",
    ],
  },
];

interface EmptyStateProps {
  onSend: (text: string) => void;
  conversations: ConversationSummary[];
  onLoadConversation: (id: string) => void;
  onStartNew: () => void;
}

export function EmptyState({
  onSend,
  conversations,
  onLoadConversation,
  onStartNew,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-[12vh] pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center max-w-2xl w-full px-4"
      >
        <h1 className="text-2xl font-medium text-black dark:text-white mb-8">
          How can I help you today?
        </h1>

        {/* Health topic cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-8">
          {HEALTH_TOPICS.map((topic) => (
            <motion.button
              key={topic.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSend(topic.questions[0])}
              className="flex flex-col items-start gap-2 rounded-2xl border border-[#E5E5E5] bg-white p-4 text-left shadow-sm transition hover:border-[#D0D0D0] hover:shadow-md dark:border-[#333] dark:bg-[#1F1F1F] dark:hover:border-[#555]"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${topic.color}`}>
                <svg width="18" height="18">
                  <use href={`#${topic.icon}`} />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#333] dark:text-[#ECECF1]">
                {topic.title}
              </span>
              <span className="text-xs text-[#8E8EA0] line-clamp-1">
                {topic.questions[0]}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Recent conversations */}
        {conversations.length > 0 && (
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#8E8EA0] uppercase tracking-wider">
                Recent conversations
              </span>
              <button
                type="button"
                onClick={onStartNew}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                New chat
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {conversations.slice(0, 3).map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onLoadConversation(conv.id)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#666] transition hover:bg-[#F5F5F5] dark:text-[#A0A0A0] dark:hover:bg-[#2F2F2F]"
                >
                  <svg width="14" height="14" className="shrink-0 text-[#999]">
                    <use href="#i-chat" />
                  </svg>
                  <span className="truncate">{conv.firstUserMessage || "Conversation"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-[11px] text-[#B0B0B0] dark:text-[#666]">
          AI-generated. Verify with a healthcare professional.
        </p>
      </motion.div>
    </div>
  );
}
