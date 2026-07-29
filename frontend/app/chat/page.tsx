"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sendChatMessage, getCrisisResources, getHistory, getConversationMessages, type ChatSource, type CrisisResource, type Language, type ConversationSummary } from "@/lib/apiClient";
import { useToast } from "@/lib/useToast";
import { getCurrentUser, requestConsultation, type UserProfile } from "@/lib/userApiClient";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/lib/LanguageContext";

const ANONYMOUS_MODE_KEY = "inshuti_anonymous_mode";

interface DisplayMessage {
  role: "user" | "bot";
  content: string;
  time: string;
}

const QUICK_TOPICS = [
  {
    icon: "i-droplet",
    bg: "bg-coral-100",
    fg: "text-coral-dark",
    name: "Menstrual Health",
    starterEn: "What is a normal menstrual cycle?",
    starterRw: "Umuzunguruko usanzwe w'imihango ni uwuhe?",
    starterFr: "Qu'est-ce qu'un cycle menstruel normal?",
    starterSw: "Mzunguko wa kawaida wa hedhi ni upi?",
  },
  {
    icon: "i-baby",
    bg: "bg-gold-100",
    fg: "text-[#8A5E1E]",
    name: "Pregnancy",
    starterEn: "What are early signs of pregnancy?",
    starterRw: "Ni ibihe bimenyetso bya mbere by'inda?",
    starterFr: "Quels sont les premiers signes de grossesse?",
    starterSw: "Dalili za mwanzo za ujauzito ni zipi?",
  },
  {
    icon: "i-heart",
    bg: "bg-teal-100",
    fg: "text-teal-700",
    name: "Relationships",
    starterEn: "What makes a relationship healthy?",
    starterRw: "Ibigize imibanire myiza ni ibihe?",
    starterFr: "Qu'est-ce qui rend une relation saine?",
    starterSw: "Ni nini hufanya uhusiano kuwa mzuri?",
  },
  {
    icon: "i-pill",
    bg: "bg-coral-100",
    fg: "text-coral-dark",
    name: "Family Planning",
    starterEn: "What contraception options exist?",
    starterRw: "Hari ubuhe buryo bwo kuboneza urubyaro?",
    starterFr: "Quelles sont les options de contraception?",
    starterSw: "Ni njia zipi za uzazi wa mpango zipo?",
  },
  {
    icon: "i-shield",
    bg: "bg-teal-100",
    fg: "text-teal-700",
    name: "HIV & STIs",
    starterEn: "How is HIV transmitted?",
    starterRw: "Virusi itera SIDA yandura ite?",
    starterFr: "Comment le VIH se transmet-il?",
    starterSw: "Virusi vya UKIMWI huambukizwa vipi?",
  },
  {
    icon: "i-mind",
    bg: "bg-gold-100",
    fg: "text-[#8A5E1E]",
    name: "Mental Health",
    starterEn: "How do I cope with stress?",
    starterRw: "Nihanganira umuhangayiko nte?",
    starterFr: "Comment gérer le stress?",
    starterSw: "Ninawezaje kukabiliana na mfadhaiko?",
  },
];

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const GREETING: Record<Language, string> = {
  EN: "Muraho! I'm Inshuti — you can ask me anything about your body, relationships, or health. This chat is anonymous. What's on your mind today?",
  RW: "Muraho! Ndi Inshuti — unshobora kubaza ikintu cyose ku mubiri wawe, imibanire yawe, cyangwa ubuzima bwawe. Iki kiganiro ni ibanga. Ni iki uri gutekereza kuri cyo uyu munsi?",
  FR: "Muraho! Je suis Inshuti — vous pouvez me poser des questions sur votre corps, vos relations ou votre santé. Cette conversation est anonyme. Qu'est-ce qui vous préoccupe aujourd'hui ?",
  SW: "Muraho! Mimi ni Inshuti — unaweza kuniuliza chochote kuhusu mwili wako, mahusiano, au afya yako. Mazungumzo haya ni ya siri. Nini kichwani mwako leo?",
};

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const { toast } = useToast();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { role: "bot", content: GREETING.EN, time: nowLabel() },
  ]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [canRequestFollowUp, setCanRequestFollowUp] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [showCrisisInfo, setShowCrisisInfo] = useState(false);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const [crisisResourcesLoading, setCrisisResourcesLoading] = useState(false);
  const crisisInfoRef = useRef<HTMLDivElement>(null);
  const [requestingHelp, setRequestingHelp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    void getCurrentUser().then((loadedUser) => {
      setUser(loadedUser);
      const stored = localStorage.getItem(ANONYMOUS_MODE_KEY);
      setAnonymousMode(stored !== null ? stored === "true" : !loadedUser);
    });
    void getHistory().then((h) => setConversations(h.conversations)).catch(() => {});
  }, []);

  async function loadConversation(convId: string) {
    setSidebarOpen(false);
    try {
      const conversation = await getConversationMessages(convId);
      setConversationId(conversation.id);
      setMessages(
        conversation.messages.map((m) => ({
          role: m.role === "USER" ? ("user" as const) : ("bot" as const),
          content: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),
      );
      setSources([]);
      setShowSources(false);
      setQuickReplies([]);
      setCanRequestFollowUp(false);
    } catch {
      toast("Failed to load conversation", "error");
    }
  }

  function startNewChat() {
    setMessages([{ role: "bot", content: GREETING[language], time: nowLabel() }]);
    setSources([]);
    setShowSources(false);
    setQuickReplies([]);
    setConversationId(null);
    setCanRequestFollowUp(false);
    setSidebarOpen(false);
  }

  function toggleAnonymousMode() {
    const next = !anonymousMode;
    setAnonymousMode(next);
    localStorage.setItem(ANONYMOUS_MODE_KEY, String(next));
  }

  async function openCrisisInfo() {
    setShowCrisisInfo(true);
    if (crisisResources.length === 0) {
      setCrisisResourcesLoading(true);
      try {
        setCrisisResources(await getCrisisResources());
      } catch {
      } finally {
        setCrisisResourcesLoading(false);
      }
    }
  }

  async function handleRequestFollowUp() {
    if (!conversationId || requestingHelp) return;
    setRequestingHelp(true);
    try {
      await requestConsultation(conversationId);
      toast("A health worker will follow up with you soon.", "success");
      router.push("/consultations");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to request a health worker", "error");
    } finally {
      setRequestingHelp(false);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed, time: nowLabel() }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);
    setQuickReplies([]);
    setCanRequestFollowUp(false);

    try {
      const response = await sendChatMessage(trimmed, language);
      setMessages((prev) => [...prev, { role: "bot", content: response.reply, time: nowLabel() }]);
      setSources(response.sources);
      setQuickReplies(response.quickReplies);
      setConversationId(response.conversationId ?? null);
      setCanRequestFollowUp(!!response.canRequestHumanFollowUp);
    } catch {
      toast(
        language === "RW"
          ? "Habaye ikibazo. Ongera ugerageze."
          : language === "FR"
            ? "Un problème est survenu. Veuillez réessayer."
            : language === "SW"
              ? "Kuna tatizo. Tafadhali jaribu tena."
              : "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setSending(false);
    }
  }

  const searchParams = useSearchParams();
  const topicDeepLinkHandled = useRef(false);
  useEffect(() => {
    const topicIcon = searchParams.get("topic");
    if (!topicIcon || topicDeepLinkHandled.current) return;
    const topic = QUICK_TOPICS.find((t) => t.icon === topicIcon);
    if (!topic) return;
    topicDeepLinkHandled.current = true;
    router.replace("/chat");
    setTimeout(() => {
      void send(topic[`starter${language.charAt(0)}${language.slice(1).toLowerCase()}` as keyof typeof topic] as string);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  const hasMessages = messages.length > 0;

  const chatContent = (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Chat history sidebar — ChatGPT-style */}
      <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </AnimatePresence>
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-40 flex h-full w-[280px] flex-col bg-[#0D2B29] text-[#DCEBE8] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1F4A45] px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-[16px] font-bold text-white">Inshuti</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#7FA79F] hover:bg-[#123934] hover:text-white"
          >
            <svg width="14" height="14"><use href="#i-close" /></svg>
          </button>
        </div>

        <div className="px-3 py-3">
          <button
            type="button"
            onClick={startNewChat}
            className="flex w-full items-center gap-2 rounded-md border border-[#1F4A45] px-3 py-2 text-[13px] font-semibold text-[#DCEBE8] transition hover:bg-[#123934]"
          >
            <svg width="14" height="14"><use href="#i-plus" /></svg>
            {language === "RW" ? "Ikiganiro Gishya" : language === "FR" ? "Nouvelle discussion" : language === "SW" ? "Mazungumzo Mapya" : "New chat"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {conversations.length === 0 && (
            <p className="px-2 pt-4 text-[12px] text-[#7FA79F]">
              {language === "RW" ? "Nta biganiro byabanje." : language === "FR" ? "Aucune discussion précédente." : language === "SW" ? "Hakuna mazungumzo ya awali." : "No previous conversations."}
            </p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => void loadConversation(conv.id)}
              className="w-full rounded-md px-3 py-2.5 text-left text-[12.5px] leading-[1.4] text-[#B7D6D1] transition hover:bg-[#123934]"
            >
              <span className="line-clamp-2">
                {conv.firstUserMessage || (language === "RW" ? "Ikiganiro kitangiye" : language === "FR" ? "Conversation" : language === "SW" ? "Mazungumzo" : "Conversation")}
              </span>
              <span className="mt-1 block text-[10px] text-[#7FA79F]">
                {new Date(conv.createdAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Minimal header — ChatGPT-style */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[860px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-gray-100"
              aria-label="Toggle history sidebar"
            >
              <svg width="18" height="18"><use href="#i-menu" /></svg>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700">
              <svg width="16" height="16" className="text-white">
                <use href="#i-bot" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-teal-900">Inshuti Assistant</div>
              <div className="text-[11px] text-ink-soft">
                {user && !anonymousMode ? `Signed in as ${user.name}` : "Anonymous · Private"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={toggleAnonymousMode}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  anonymousMode ? "bg-teal-100 text-teal-700" : "bg-gold-100 text-[#8A5E1E]"
                }`}
              >
                {anonymousMode ? "Anonymous" : "Identified"}
              </button>
            )}
            {!user && <LanguageSwitcher value={language} onChange={setLanguage} />}
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition hover:bg-gray-100"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Crisis bar with immediate call */}
      {!showCrisisInfo && (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-gold-100/80 py-[7px] text-center text-[12px] font-semibold text-[#8A5E1E]">
          <span>
            {language === "RW" ? "Uri mu kaga? " : language === "FR" ? "En crise ? " : language === "SW" ? "Katika hatari? " : "In crisis? "}
          </span>
          <a
            href="tel:116"
            className="inline-flex items-center gap-1 rounded-full bg-coral px-3 py-1 text-[11px] text-white shadow-sm transition hover:bg-coral-dark"
          >
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1v3.5c0 .6-.4 1-1 1C9.1 21 3 14.9 3 7.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            {language === "RW" ? "Hamagara 116" : language === "FR" ? "Appelez le 116" : language === "SW" ? "Piga 116" : "Call 116"}
          </a>
          <span className="hidden sm:inline">&middot;</span>
          <button
            type="button"
            onClick={() => void openCrisisInfo()}
            className="underline hover:no-underline"
          >
            {language === "RW" ? "Kanda hano ubone ubufasha" : language === "FR" ? "Appuyez ici pour de l'aide" : language === "SW" ? "Bonyeza hapa kwa msaada" : "Tap here for immediate support"}
          </button>
        </div>
      )}

      {showCrisisInfo && (
        <div id="crisis-info" ref={crisisInfoRef} className="border-b border-line bg-gold-100/60 px-4 py-3">
          <div className="mx-auto flex max-w-[720px] items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#8A5E1E]">
                {language === "RW" ? "Ubufasha bwihutirwa" : language === "FR" ? "Ressources d'urgence" : language === "SW" ? "Rasilimali za dharura" : "Immediate support resources"}
              </div>
              {crisisResourcesLoading ? (
                <p className="mt-1 text-[12px] text-[#8A5E1E]">
                  {language === "RW" ? "Turimo gutegura…" : language === "FR" ? "Chargement…" : language === "SW" ? "Inapakia…" : "Loading…"}
                </p>
              ) : crisisResources.length === 0 ? (
                <p className="mt-1 text-[12px] text-[#8A5E1E]">
                  {language === "RW"
                    ? "Nta bufasha buboneka ubu. Nyabona vugana n'ivuriro riri hafi."
                    : language === "FR"
                      ? "Aucune ressource disponible. Contactez un établissement de santé proche."
                      : language === "SW"
                        ? "Hakuna rasilimali zinazopatikana. Wasiliana na kituo cha afya."
                        : "No resources available. Please contact a nearby health facility."}
                </p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {crisisResources.map((r) => (
                    <li key={r.id} className="text-[12px] text-[#8A5E1E]">
                      <span className="font-semibold">{r.name}</span> — {r.contact}
                      <span className="text-[#8A5E1E]/70"> ({r.region})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowCrisisInfo(false)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#8A5E1E] hover:bg-gold-100"
            >
              <svg width="12" height="12"><use href="#i-close" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages area — ChatGPT centered layout */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[860px] px-4 py-6">
          {/* Quick topics as horizontal chips — shown only at start */}
          {!hasMessages && (
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic.name}
                  type="button"
                  onClick={() => void send(topic[`starter${language.charAt(0) + language.slice(1).toLowerCase()}` as keyof typeof topic])}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition hover:opacity-80 ${topic.bg} ${topic.fg}`}
                >
                  <svg width="12" height="12"><use href={`#${topic.icon}`} /></svg>
                  {topic.name}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              className="mb-6"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    message.role === "bot" ? "bg-teal-700" : "bg-gray-200"
                  }`}
                >
                  {message.role === "bot" ? (
                    <svg width="14" height="14" className="text-white"><use href="#i-bot" /></svg>
                  ) : (
                    <svg width="14" height="14" className="text-ink"><use href="#i-user-check" /></svg>
                  )}
                </div>
                <div className={`min-w-0 ${message.role === "user" ? "max-w-[75%]" : "max-w-[85%]"}`}>
                  <div
                    className={`rounded-2xl px-[16px] py-[12px] text-[14.5px] leading-[1.65] ${
                      message.role === "bot"
                        ? "rounded-bl-[4px] bg-gray-50 text-ink"
                        : "rounded-br-[4px] bg-teal-700 text-white"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <span className="block last:mb-0">{children}</span>,
                        ul: ({ children }) => <ul className="my-1 list-disc pl-5">{children}</ul>,
                        ol: ({ children }) => <ol className="my-1 list-decimal pl-5">{children}</ol>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div className={`mt-[4px] flex items-center gap-3 font-mono text-[10px] text-gray-400 ${message.role === "user" ? "justify-end" : ""}`}>
                    <span>{message.time}</span>
                    {message.role === "bot" && sources.length > 0 && i === messages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setShowSources(!showSources)}
                        className="text-teal-700 underline hover:no-underline"
                      >
                        {showSources ? "Hide sources" : "View sources"}
                      </button>
                    )}
                  </div>

                  {/* Inline sources */}
                  {message.role === "bot" && showSources && sources.length > 0 && i === messages.length - 1 && (
                    <div className="mt-2 rounded-xl border border-line bg-white p-3">
                      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                        {language === "RW" ? "Inkomoko" : language === "FR" ? "Sources" : language === "SW" ? "Vyanzo" : "Sources"}
                      </div>
                      {sources.map((source) => (
                        <div key={source.id} className="mb-2 last:mb-0">
                          <div className="text-[13px] font-bold text-teal-900">
                            {language === "RW" ? source.titleRw : source.titleEn}
                          </div>
                          {source.bodySnippet && (
                            <div className="mt-0.5 text-[12px] leading-[1.5] text-ink-soft">{source.bodySnippet}</div>
                          )}
                          {source.externalUrl && (
                            <a
                              href={source.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-teal-700 underline"
                            >
                              {language === "RW" ? "Reba inkomoko" : language === "FR" ? "Voir la source" : language === "SW" ? "Ona chanzo" : "View source"}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick replies after bot message */}
              {message.role === "bot" && quickReplies.length > 0 && i === messages.length - 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-10">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => void send(reply)}
                      className="cursor-pointer rounded-full border border-teal-700 bg-white px-3 py-1.5 text-[12px] font-semibold text-teal-700 transition hover:bg-teal-50"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {sending && (
            <motion.div
              className="mb-6 flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700">
                <svg width="14" height="14" className="text-white"><use href="#i-bot" /></svg>
              </div>
              <div className="rounded-2xl rounded-bl-[4px] bg-gray-50 px-[16px] py-[12px] text-[14px] text-ink-soft">
                {language === "RW" ? "Inshuti irandika…" : language === "FR" ? "Inshuti écrit…" : language === "SW" ? "Inshuti anaandika…" : "Inshuti is typing…"}
              </div>
            </motion.div>
          )}

          {/* Follow-up CTA */}
          {canRequestFollowUp && user && !anonymousMode && conversationId && (
            <div className="mb-6 ml-10 flex items-center gap-3 rounded-2xl border border-teal-700 bg-teal-100 px-4 py-3">
              <span className="flex-1 text-[13px] font-semibold text-teal-900">
                {language === "RW" ? "Wifuza kuvugana n'umukozi w'ubuzima?" : language === "FR" ? "Vous souhaitez parler à un professionnel de santé ?" : language === "SW" ? "Ungependa kuzungumza na mtaalamu wa afya?" : "Would you like to talk to a health worker?"}
              </span>
              <button
                type="button"
                onClick={() => void handleRequestFollowUp()}
                disabled={requestingHelp}
                className="rounded-full bg-teal-700 px-4 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {requestingHelp ? "Requesting…" : language === "RW" ? "Kanda" : language === "FR" ? "Parler" : language === "SW" ? "Ongea" : "Talk"}
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input bar — ChatGPT-style */}
      <div className="border-t border-gray-100 bg-white pb-3 pt-2">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-[860px] items-end gap-2 px-4"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 px-[16px] py-[11px] font-body text-[14.5px] leading-[1.4] outline-none transition focus:border-teal-400 focus:bg-white focus:shadow-sm"
            placeholder={
              language === "RW"
                ? "Andika ikibazo cyawe…"
                : language === "FR"
                  ? "Écrivez votre question…"
                  : language === "SW"
                    ? "Andika swali lako…"
                    : "Type your question in English or Kinyarwanda…"
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-600 disabled:opacity-40"
          >
            <svg width="18" height="18">
              <use href="#i-send" />
            </svg>
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-[860px] px-4 text-[10px] text-gray-400">
          {language === "RW" ? "Ibi byifashishijwe na AI. Ongera ugerageze amakuru y'abaganga." : language === "FR" ? "Alimenté par l'IA. Vérifiez toujours auprès d'un professionnel de santé." : language === "SW" ? "Inaendeshwa na AI. Thibitisha na mtaalamu wa afya." : "AI-powered. Always verify with a healthcare professional."}
        </p>
      </div>
    </div>
  );

  if (user) {
    return (
      <AppShell active="/chat" session={{ kind: "user", user }} flush>
        {chatContent}
      </AppShell>
    );
  }

  return (
    <>
      {chatContent}
      <SiteFooter />
    </>
  );
}
