"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sendChatMessage, type ChatSource, type Language } from "@/lib/apiClient";
import { useToast } from "@/lib/useToast";

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
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("EN");
  const [messages, setMessages] = useState<DisplayMessage[]>([
    { role: "bot", content: GREETING.EN, time: nowLabel() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed, time: nowLabel() }]);
    setInput("");
    setSending(true);
    setQuickReplies([]);

    try {
      const response = await sendChatMessage(trimmed, language);
      setMessages((prev) => [...prev, { role: "bot", content: response.reply, time: nowLabel() }]);
      setSources(response.sources);
      setQuickReplies(response.quickReplies);
      setActiveTopicName(response.topic ? (language === "RW" ? response.topic.nameRw : response.topic.nameEn) : null);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-line bg-white px-7 py-4">
        <div className="flex items-center gap-[14px]">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white"
          >
            <svg width="16" height="16">
              <use href="#i-back" />
            </svg>
          </Link>
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-teal-700">
            <svg width="18" height="18" className="text-white">
              <use href="#i-bot" />
            </svg>
          </div>
          <div>
            <div className="text-[14.5px] font-bold text-teal-900">Inshuti Assistant</div>
            <div className="text-xs text-ink-soft">Anonymous · Private session</div>
          </div>
        </div>
        <div className="flex items-center gap-[14px]">
          <div className="flex rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
            {(["EN", "RW", "FR", "SW"] as const).map((lang) => (
              <span
                key={lang}
                className={`cursor-pointer rounded-full px-2.5 py-1.5 ${language === lang ? "bg-teal-700 text-white" : "text-teal-700"}`}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </span>
            ))}
          </div>
          <Link
            href="/my-space"
            title="My Space"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line bg-white"
          >
            <svg width="16" height="16" className="text-teal-700">
              <use href="#i-clock" />
            </svg>
          </Link>
          <Link href="/" className="rounded-full px-4 py-[9px] text-[13px] font-semibold text-ink-soft">
            End chat
          </Link>
        </div>
      </div>

      <div className="bg-gold-100 py-[9px] text-center text-[12.5px] font-semibold text-[#8A5E1E]">
        {language === "RW" ? "Uri mu kaga cyangwa ukeneye ubufasha vuba? " : language === "FR" ? "En crise ou besoin d'aide urgente ? " : language === "SW" ? "Katika hatari au unahitaji msaada wa dharura? " : "In crisis or need urgent help? "}
        <a href="#crisis-info" className="underline">
          {language === "RW" ? "Kanda hano ubone ubufasha" : language === "FR" ? "Appuyez ici pour des ressources d'aide immédiate" : language === "SW" ? "Bonyeza hapa kwa usaidizi wa haraka" : "Tap here for immediate support resources"}
        </a>
      </div>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-[250px_1fr_280px]">
        <aside className="hidden border-r border-line p-4 px-4 py-[22px] md:block">
          <div className="px-2 pb-[10px] font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
            {language === "RW" ? "Ingingo zihuse" : language === "FR" ? "Sujets rapides" : language === "SW" ? "Mada za haraka" : "Quick topics"}
          </div>
          {QUICK_TOPICS.map((topic) => (
            <div
              key={topic.name}
              className={`flex cursor-pointer items-center gap-[10px] rounded-xl px-[10px] py-[11px] text-sm font-semibold ${
                activeTopicName === topic.name ? "bg-teal-100 text-teal-700" : "text-ink-soft"
              }`}
              onClick={() => void send(topic[`starter${language.charAt(0) + language.slice(1).toLowerCase()}` as keyof typeof topic])}
            >
              <div className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg ${topic.bg} ${topic.fg}`}>
                <svg width="14" height="14">
                  <use href={`#${topic.icon}`} />
                </svg>
              </div>
              {topic.name}
            </div>
          ))}
        </aside>

        <main className="flex flex-col overflow-y-auto px-[30px] py-[26px]">
          {messages.map((message, i) => (
            <div
              className={`mb-[18px] flex max-w-[62%] gap-[10px] ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              key={i}
            >
              <div
                className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === "bot" ? "bg-teal-700" : "bg-gold"
                }`}
              >
                {message.role === "bot" && (
                  <svg width="15" height="15" className="text-white">
                    <use href="#i-bot" />
                  </svg>
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl px-[17px] py-[14px] text-[14.5px] leading-[1.6] ${
                    message.role === "bot"
                      ? "rounded-bl-[4px] border border-line bg-white"
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
                <div className="mt-[6px] font-mono text-[11px] text-ink-soft">{message.time}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="mb-[18px] flex max-w-[62%] gap-[10px]">
              <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-teal-700">
                <svg width="15" height="15" className="text-white">
                  <use href="#i-bot" />
                </svg>
              </div>
              <div>
                <div className="rounded-2xl rounded-bl-[4px] border border-line bg-white px-[17px] py-[14px] text-[14.5px] leading-[1.6]">
                  {language === "RW" ? "Inshuti irandika…" : language === "FR" ? "Inshuti écrit…" : language === "SW" ? "Inshuti anaandika…" : "Inshuti is typing…"}
                </div>
              </div>
            </div>
          )}
          {quickReplies.length > 0 && (
            <div className="ml-10 mb-1 mt-1.5 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <div
                  className="cursor-pointer rounded-full border border-teal-700 bg-white px-[14px] py-2 text-[12.5px] font-semibold text-teal-700"
                  key={reply}
                  onClick={() => void send(reply)}
                >
                  {reply}
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        <aside className="hidden border-l border-line p-[22px] lg:block">
          <div className="pb-[10px] font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
            {language === "RW" ? "Inkomoko z'iki gisubizo" : language === "FR" ? "Sources de cette réponse" : language === "SW" ? "Vyanzo vya jibu hili" : "Sources for this answer"}
          </div>
          {sources.length === 0 && (
            <p className="text-[12.5px] text-ink-soft">
              {language === "RW" ? "Nta nkomoko zabonetse kuri iki gisubizo." : language === "FR" ? "Pas de sources spécifiques pour cette réponse." : language === "SW" ? "Hakuna vyanzo maalum vya jibu hili." : "No specific sources for this answer yet."}
            </p>
          )}
          {sources.map((source) => (
            <div className="mb-3 rounded-[14px] border border-line p-[14px]" key={source.id}>
              <div className="text-[13.5px] font-bold text-teal-900">
                {language === "RW" ? source.titleRw : source.titleEn}
              </div>
              {source.bodySnippet && (
                <div className="mt-1.5 text-[12px] leading-[1.5] text-ink-soft">
                  {source.bodySnippet}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-soft">
                  {language === "RW" ? "Inshuti" : language === "FR" ? "Inshuti" : language === "SW" ? "Inshuti" : "Inshuti"} KB
                </span>
                {source.externalUrl && (
                  <a
                    href={source.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-teal-700 underline"
                  >
                    {language === "RW" ? "Reba inkomoko" : language === "FR" ? "Voir la source" : language === "SW" ? "Ona chanzo" : "View source"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </aside>
      </div>

      <form
        className="flex gap-[10px] border-t border-line bg-white px-[30px] pb-2 pt-4"
        onSubmit={handleSubmit}
      >
        <input
          className="flex-1 rounded-full border border-line bg-paper-2 px-[18px] py-[14px] font-body text-[14.5px]"
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
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-coral disabled:opacity-50"
          type="submit"
          disabled={sending || !input.trim()}
        >
          <svg width="18" height="18">
            <use href="#i-send" />
          </svg>
        </button>
      </form>
    </div>
  );
}
