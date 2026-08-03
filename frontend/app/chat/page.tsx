"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  sendChatMessage,
  getCrisisResources,
  getHistory,
  getConversationMessages,
  type ChatSource,
  type CrisisResource,
  type Language,
  type ConversationSummary,
} from "@/lib/apiClient";
import { useToast } from "@/lib/useToast";
import { getCurrentUser, requestConsultation, type UserProfile } from "@/lib/userApiClient";
import { useLanguage } from "@/lib/LanguageContext";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { CrisisBar } from "@/components/chat/CrisisBar";
import { FollowUpCTA } from "@/components/chat/FollowUpCTA";

const ANONYMOUS_MODE_KEY = "inshuti_anonymous_mode";

interface DisplayMessage {
  role: "user" | "bot";
  content: string;
  time: string;
  id?: string;
}

const QUICK_TOPICS = [
  {
    icon: "i-droplet",
    starterEn: "What is a normal menstrual cycle?",
    starterRw: "Umuzunguruko usanzwe w'imihango ni uwuhe?",
    starterFr: "Qu'est-ce qu'un cycle menstruel normal?",
    starterSw: "Mzunguko wa kawaida wa hedhi ni upi?",
  },
  {
    icon: "i-baby",
    starterEn: "What are early signs of pregnancy?",
    starterRw: "Ni ibihe bimenyetso bya mbere by'inda?",
    starterFr: "Quels sont les premiers signes de grossesse?",
    starterSw: "Dalili za mwanzo za ujauzito ni zipi?",
  },
  {
    icon: "i-heart",
    starterEn: "What makes a relationship healthy?",
    starterRw: "Ibigize imibanire myiza ni ibihe?",
    starterFr: "Qu'est-ce qui rend une relation saine?",
    starterSw: "Ni nini hufanya uhusiano kuwa mzuri?",
  },
  {
    icon: "i-pill",
    starterEn: "What contraception options exist?",
    starterRw: "Hari ubuhe buryo bwo kuboneza urubyaro?",
    starterFr: "Quelles sont les options de contraception?",
    starterSw: "Ni njia zipi za uzazi wa mpango zipo?",
  },
  {
    icon: "i-shield",
    starterEn: "How is HIV transmitted?",
    starterRw: "Virusi itera SIDA yandura ite?",
    starterFr: "Comment le VIH se transmet-il?",
    starterSw: "Virusi vya UKIMWI huambukizwa vipi?",
  },
  {
    icon: "i-mind",
    starterEn: "How do I cope with stress?",
    starterRw: "Nihanganira umuhangayiko nte?",
    starterFr: "Comment gérer le stress?",
    starterSw: "Ninawezaje kukabiliana na mfadhaiko?",
  },
];

const GREETING: Record<Language, string> = {
  EN: "Muraho! I'm **Inshuti** — you can ask me anything about your body, relationships, or health. This chat is **anonymous** and **private**. What's on your mind today?",
  RW: "Muraho! Ndi **Inshuti** — unshobora kubaza ikintu cyose ku mubiri wawe, imibanire yawe, cyangwa ubuzima bwawe. Iki kiganiro ni **ibanga**. Ni iki uri gutekereza kuri cyo uyu munsi?",
  FR: "Muraho! Je suis **Inshuti** — vous pouvez me poser des questions sur votre corps, vos relations ou votre santé. Cette conversation est **anonyme** et **privée**. Qu'est-ce qui vous préoccupe aujourd'hui ?",
  SW: "Muraho! Mimi ni **Inshuti** — unaweza kuniuliza chochote kuhusu mwili wako, mahusiano, au afya yako. Mazungumzo haya ni **siri**. Nini kichwani mwako leo?",
};

const BACK_LABEL: Record<Language, string> = {
  EN: "Back",
  RW: "Subira inyuma",
  FR: "Retour",
  SW: "Rudi",
};

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<DisplayMessage[]>([
    { role: "bot", content: GREETING.EN, time: nowLabel() },
  ]);
  const [input, setInput] = useState("");
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
  const [requestingHelp, setRequestingHelp] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "generating" | "finished">("idle");
  const [convSearch, setConvSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topicDeepLinkHandled = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    void getCurrentUser().then((loadedUser) => {
      setUser(loadedUser);
      const stored = localStorage.getItem(ANONYMOUS_MODE_KEY);
      setAnonymousMode(stored !== null ? stored === "true" : !loadedUser);
    });
    void getHistory().then((h) => setConversations(h.conversations)).catch(() => {});
  }, []);

  useEffect(() => {
    const topicIcon = searchParams.get("topic");
    if (!topicIcon || topicDeepLinkHandled.current) return;
    const topic = QUICK_TOPICS.find((t) => t.icon === topicIcon);
    if (!topic) return;
    topicDeepLinkHandled.current = true;
    router.replace("/chat");
    setTimeout(() => {
      void send(
        topic[`starter${language.charAt(0)}${language.slice(1).toLowerCase()}` as keyof typeof topic] as string,
      );
    }, 0);
    // send is defined in the component so it can use the current conversation state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, language, router]);

  async function loadConversation(convId: string) {
    setMobileSidebarOpen(false);
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
      scrollToBottom(false);
    } catch {
      toast("Failed to load conversation", "error");
    }
  }

  async function refreshHistory() {
    try {
      const h = await getHistory();
      setConversations(h.conversations);
    } catch {}
  }

  function startNewChat() {
    setMessages([{ role: "bot", content: GREETING[language], time: nowLabel() }]);
    setSources([]);
    setShowSources(false);
    setQuickReplies([]);
    setConversationId(null);
    setCanRequestFollowUp(false);
    setMobileSidebarOpen(false);
    setAiStatus("idle");
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
    if (!user || anonymousMode) {
      toast(
        language === "RW" ? "Injira kugira ngo umukozi w'ubuzima abashe kugusubiza mu ibanga." :
          language === "FR" ? "Connectez-vous pour qu'un professionnel puisse vous répondre en privé." :
            language === "SW" ? "Ingia ili mhudumu wa afya aweze kukujibu kwa faragha." :
              "Sign in so a health worker can reply to you privately.",
        "info",
      );
      router.push("/login?returnTo=/chat");
      return;
    }
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
    setAiStatus("thinking");
    setSending(true);
    setQuickReplies([]);
    setCanRequestFollowUp(false);
    setShowSources(false);

    try {
      setAiStatus("generating");
      const response = await sendChatMessage(trimmed, language, anonymousMode);
      setMessages((prev) => [...prev, { role: "bot", content: response.reply, time: nowLabel() }]);
      setSources(response.sources);
      setQuickReplies(response.quickReplies);
      setConversationId(response.conversationId ?? null);
      setCanRequestFollowUp(!!response.canRequestHumanFollowUp);
      setAiStatus("finished");
      if (response.sources.length > 0) setShowSources(true);
    } catch {
      setAiStatus("idle");
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
      await refreshHistory();
    }
  }

  function handleSuggestedAction(actionKey: string) {
    const lastBotMsg = [...messages].reverse().find((m) => m.role === "bot");
    if (!lastBotMsg) return;

    const prompts: Record<string, string> = {
      explain: `Can you explain more about: ${lastBotMsg.content.slice(0, 100)}...`,
      simplify: `Can you simplify this for me: ${lastBotMsg.content.slice(0, 100)}...`,
      summarize: `Can you summarize: ${lastBotMsg.content.slice(0, 100)}...`,
      translate: `Can you translate this to Kinyarwanda: ${lastBotMsg.content.slice(0, 100)}...`,
    };

    const text = prompts[actionKey];
    if (text) void send(text);
  }

  function handleFeedback(key: string, type: "helpful" | "not-helpful") {
    toast(
      type === "helpful"
        ? (language === "RW" ? "Murakoze!" : language === "FR" ? "Merci !" : language === "SW" ? "Asante!" : "Thanks for the feedback!")
        : (language === "RW" ? "Murakoze. Tuzagerageza kubyirushaho." : language === "FR" ? "Merci. Nous allons nous améliorer." : language === "SW" ? "Asante. Tutajaribu kuboresha." : "Thanks. We'll work on improving."),
      "info",
    );
  }

  function retryLast() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1));
      void send(lastUserMsg.content);
    }
  }

  function handleShare() {
    navigator.clipboard
      .writeText(`${window.location.origin}/chat?share=${conversationId ?? ""}`)
      .then(() => toast("Link copied", "info"))
      .catch(() => {});
  }

  function handleSend() {
    void send(input);
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  const hasMessages = messages.length > 1;
  const activeConversation = conversations.find((conversation) => conversation.id === conversationId);
  const activeTopic = activeConversation?.topic;
  const activeTopicName = activeTopic
    ? language === "RW" ? activeTopic.nameRw : activeTopic.nameEn
    : language === "RW" ? "Ubuzima rusange" : language === "FR" ? "Santé générale" : language === "SW" ? "Afya ya jumla" : "General health";

  return (
    <div className="flex h-screen flex-row bg-[#FBFAF7] dark:bg-[#212121]">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}
      {/* Desktop sidebar */}
      <div className={`hidden lg:block ${sidebarCollapsed ? "w-[60px]" : "w-[260px]"}`}>
        <ChatSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          conversations={conversations}
          user={user}
          search={convSearch}
          onSearchChange={setConvSearch}
          onNewChat={startNewChat}
          onLoadConversation={(id) => void loadConversation(id)}
        />
      </div>

      {/* Mobile sidebar drawer */}
      <div className={`fixed left-0 top-0 z-50 h-screen w-[260px] transition-transform duration-300 lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <ChatSidebar
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
          conversations={conversations}
          user={user}
          search={convSearch}
          onSearchChange={setConvSearch}
          onNewChat={startNewChat}
          onLoadConversation={(id) => void loadConversation(id)}
        />
      </div>

      <div className="flex min-w-0 flex-1">
      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Conversation header */}
        <div className="grid min-h-[72px] shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b border-line bg-white px-4 dark:border-[#333] dark:bg-[#212121] sm:px-6">
          <div className="flex items-center gap-1 justify-self-start">
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#555] transition hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-[#D0D0D0] dark:hover:bg-[#333]"
              aria-label={BACK_LABEL[language]}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">{BACK_LABEL[language]}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#666] hover:bg-[#F0F0F0] dark:text-[#A0A0A0] dark:hover:bg-[#333] lg:hidden"
              aria-label="Open chat history"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="ml-2">
              <div className="flex items-center gap-2"><h1 className="text-base font-bold text-ink dark:text-[#ECECF1]">Chat with Inshuti</h1><span className="hidden rounded-full bg-teal-100 px-2 py-1 text-[9px] font-bold text-teal-700 sm:inline">AI Assistant</span></div>
              <p className="mt-0.5 text-[10.5px] text-ink-soft dark:text-[#A0A0A0]">Your friendly health companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-self-end">
            <button type="button" onClick={startNewChat} className="hidden items-center gap-2 rounded-xl border border-teal-600 px-3.5 py-2 text-[11px] font-semibold text-teal-700 transition hover:bg-teal-100 sm:flex"><svg width="13" height="13"><use href="#i-plus" /></svg>New conversation</button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#666] hover:bg-[#F0F0F0] dark:text-[#A0A0A0] dark:hover:bg-[#333]"
              aria-label={darkMode ? "Use light theme" : "Use dark theme"}
            >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.7 17.7l.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
            </button>
          </div>
        </div>

        <div className="mx-4 mt-4 flex min-h-14 shrink-0 items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-sm dark:border-[#333] dark:bg-[#1F1F1F] sm:mx-6">
          <span className="text-[11px] text-ink-soft">Current topic</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-100 text-coral"><svg width="15" height="15"><use href={`#${activeTopic?.icon ?? "i-sparkles"}`} /></svg></span>
          <strong className="text-xs text-ink dark:text-[#ECECF1]">{activeTopicName}</strong>
          <Link href="/library" className="ml-auto text-[10.5px] font-semibold text-teal-700">Explore</Link>
        </div>

        {/* Crisis bar */}
        <CrisisBar
          showCrisisInfo={showCrisisInfo}
          crisisResources={crisisResources}
          crisisResourcesLoading={crisisResourcesLoading}
          language={language}
          onToggle={() => setShowCrisisInfo(false)}
          onOpen={() => void openCrisisInfo()}
        />

        {/* Messages */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-[860px] flex-col px-4 sm:px-6">
            {/* Empty state */}
            {!hasMessages && (
              <div className="flex-1 flex flex-col">
                <EmptyState
                  onSend={(t) => void send(t)}
                  conversations={conversations}
                  onLoadConversation={(id) => void loadConversation(id)}
                  onStartNew={startNewChat}
                />
              </div>
            )}

            {/* Messages */}
            {hasMessages && (
              <div className="flex-1 py-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, i) => (
                    <ChatMessage
                      key={`msg-${i}`}
                      message={message}
                      index={i}
                      isLast={i === messages.length - 1}
                      language={language}
                      sources={sources}
                      showSources={showSources}
                      quickReplies={quickReplies}
                      sending={sending}
                      onSend={(t) => void send(t)}
                      onRegenerate={retryLast}
                      onFeedback={handleFeedback}
                      onSuggestedAction={handleSuggestedAction}
                      onToggleSources={() => setShowSources((s) => !s)}
                      onShare={handleShare}
                    />
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {sending && <TypingIndicator status={aiStatus === "thinking" ? "thinking" : "generating"} />}
                </AnimatePresence>

                {/* Follow-up CTA */}
                {canRequestFollowUp && conversationId && (
                  <FollowUpCTA
                    language={language}
                    requestingHelp={requestingHelp}
                    onRequest={() => void handleRequestFollowUp()}
                  />
                )}

                {/* Error state */}
                {!sending && messages.length > 1 && !hasMessages && messages.length === 2 && (
                  <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center dark:border-[#3D221C] dark:bg-[#3D221C]/50">
                    <p className="text-[13px] font-semibold text-red-600 dark:text-red-400">
                      {language === "RW" ? "Habaye ikibazo. Ongera ugerageze." : language === "FR" ? "Un problème est survenu." : language === "SW" ? "Kuna tatizo." : "Something went wrong."}
                    </p>
                    <button
                      type="button"
                      onClick={retryLast}
                      className="rounded-full bg-[#10A37F] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#0E8C6E]"
                    >
                      {language === "RW" ? "Ongera ugerageze" : language === "FR" ? "Réessayer" : language === "SW" ? "Jaribu tena" : "Retry"}
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Input area - always visible */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#FBFAF7] via-[#FBFAF7] to-transparent pb-4 pt-6 dark:from-[#212121] dark:via-[#212121]">
          <ChatInput
            input={input}
            onChange={setInput}
            onSubmit={handleSend}
            sending={sending}
          />
        </div>
      </div>
      <aside className="hidden w-[310px] shrink-0 overflow-y-auto border-l border-line bg-white p-4 2xl:block dark:border-[#333] dark:bg-[#1A1A1A]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-line p-5 shadow-sm dark:border-[#333]">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100 text-coral"><svg width="18" height="18"><use href={`#${activeTopic?.icon ?? "i-sparkles"}`} /></svg></span><h2 className="text-sm font-bold">About this topic</h2></div>
            <h3 className="mt-5 text-base font-bold">{activeTopicName}</h3>
            <p className="mt-2 text-[11.5px] leading-5 text-ink-soft">Explore reviewed, youth-friendly information and ask questions in your own words.</p>
            <Link href="/library" className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-teal-700">Explore articles <span>→</span></Link>
          </section>
          <section className="rounded-2xl border border-line p-5 shadow-sm dark:border-[#333]">
            <h2 className="text-sm font-bold">Related articles</h2>
            <div className="mt-3 divide-y divide-line">{sources.length ? sources.slice(0, 3).map((source) => <div key={source.id} className="flex items-center gap-3 py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coral-100 text-coral"><svg width="14" height="14"><use href="#i-book" /></svg></span><span className="line-clamp-2 flex-1 text-[11px] font-medium">{language === "RW" ? source.titleRw : source.titleEn}</span></div>) : <p className="py-4 text-[11px] leading-5 text-ink-soft">Relevant reviewed articles will appear here after you ask a question.</p>}</div>
            <Link href="/library" className="mt-2 block text-[11px] font-semibold text-teal-700">View all articles</Link>
          </section>
          <section className="rounded-2xl border border-line p-5 shadow-sm dark:border-[#333]"><h2 className="flex items-center gap-2 text-sm font-bold"><span className="text-gold">☼</span> Quick tips</h2><ul className="mt-4 space-y-3 text-[11px] text-ink-soft"><li>✓ Ask one question at a time</li><li>✓ Never share passwords or private identifiers</li><li>✓ Talk to a professional when worried</li><li>✓ Use crisis support for urgent help</li></ul></section>
          <section className="rounded-2xl border border-[#CDE5DF] bg-[#F0F9F7] p-5 dark:bg-[#17302D]"><h2 className="text-sm font-bold">Need to talk to someone?</h2><p className="mt-2 text-[11px] leading-5 text-ink-soft">Chat with a professional or find a health centre near you.</p><Link href="/facility-locator" className="mt-4 block rounded-xl bg-teal-700 px-4 py-3 text-center text-[11px] font-semibold text-white">Find care</Link></section>
        </div>
      </aside>
      </div>
    </div>
  );
}
