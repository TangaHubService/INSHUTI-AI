import Link from "next/link";
import { Logo } from "@/components/Logo";

const TOPICS = [
  {
    icon: "i-droplet",
    bg: "bg-coral-100",
    fg: "text-coral-dark",
    name: "Menstrual Health",
    body: "Cycles, symptoms, products, and what's normal for your body.",
  },
  {
    icon: "i-baby",
    bg: "bg-gold-100",
    fg: "text-[#8A5E1E]",
    name: "Pregnancy",
    body: 'Signs, timelines, prenatal care, and answering "what if."',
  },
  {
    icon: "i-heart",
    bg: "bg-teal-100",
    fg: "text-teal-700",
    name: "Relationships",
    body: "Consent, communication, boundaries, and healthy partnerships.",
  },
  {
    icon: "i-pill",
    bg: "bg-coral-100",
    fg: "text-coral-dark",
    name: "Family Planning",
    body: "Contraception options explained clearly, without pressure.",
  },
  {
    icon: "i-shield",
    bg: "bg-teal-100",
    fg: "text-teal-700",
    name: "HIV & STIs",
    body: "Prevention, testing, and treatment — with zero judgment.",
  },
  {
    icon: "i-mind",
    bg: "bg-gold-100",
    fg: "text-[#8A5E1E]",
    name: "Mental Health",
    body: "Stress, anxiety, and support for the feelings behind the questions.",
  },
];

const FEATURES = [
  { icon: "i-bot", title: "AI Assistant", body: "Ask reproductive health questions anytime, in your own words." },
  { icon: "i-lock", title: "Anonymous", body: "No names, no accounts. Your privacy is protected by design." },
  { icon: "i-globe", title: "Bilingual", body: "Full support in English and Kinyarwanda." },
  { icon: "i-book", title: "Evidence Based", body: "Every answer is grounded in content reviewed by professionals." },
];

export default function Home() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1160px] px-8">
        <header className="flex items-center justify-between border-b border-line py-[22px]">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <Link href="/chat" className="hover:text-teal-700">
              Chat
            </Link>
            <Link href="/my-space" className="hover:text-teal-700">
              My Space
            </Link>
            <Link href="/appointments" className="hover:text-teal-700">
              Appointments
            </Link>
            <Link href="/facility-locator" className="hover:text-teal-700">
              Find Care
            </Link>
            <a href="#" className="hover:text-teal-700">
              Portals
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
              <span className="rounded-full bg-teal-700 px-2.5 py-1.5 text-white">EN</span>
              <span className="rounded-full px-2.5 py-1.5 text-teal-700">RW</span>
              <span className="rounded-full px-2.5 py-1.5 text-teal-700">FR</span>
              <span className="rounded-full px-2.5 py-1.5 text-teal-700">SW</span>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 transition hover:-translate-y-px hover:bg-teal-100">
              Log in
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark">
              Register
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 items-center gap-14 py-[76px] pb-[88px] md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="mb-[18px] block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              Free · Anonymous · Bilingual
            </span>
            <h1 className="font-display text-[52px] font-bold leading-[1.06] text-teal-900">
              Ask anything about your health. <em className="not-italic text-coral">Get a friend&apos;s answer.</em>
            </h1>
            <p className="mt-5 max-w-[480px] text-[17.5px] leading-[1.6] text-ink-soft">
              Inshuti is an AI assistant that gives young people honest, judgment-free answers on
              sexual and reproductive health — reviewed by professionals, available anytime, in
              English or Kinyarwanda.
            </p>
            <div className="mt-8 flex gap-[14px]">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
              >
                Chat with Inshuti
                <svg width="16" height="16">
                  <use href="#i-arrow" />
                </svg>
              </Link>
              <a
                href="#topics"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-teal-700 px-[26px] py-[13px] text-[15px] font-semibold text-teal-700 transition hover:-translate-y-px hover:bg-teal-100"
              >
                Browse topics
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-[22px]">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                <svg width="16" height="16" className="text-teal-700">
                  <use href="#i-lock" />
                </svg>
                No sign-up required
              </div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                <svg width="16" height="16" className="text-teal-700">
                  <use href="#i-book" />
                </svg>
                Reviewed by clinicians
              </div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                <svg width="16" height="16" className="text-teal-700">
                  <use href="#i-globe" />
                </svg>
                English &amp; Kinyarwanda
              </div>
            </div>
          </div>

          <div className="relative">
            <svg className="absolute -right-5 -top-10 z-0 w-[340px] opacity-50" viewBox="0 0 64 64">
              <use href="#mark-knot" />
            </svg>
            <div className="relative z-10 rounded-[32px] border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2.5 border-b border-line pb-[14px]">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-teal-700">
                  <svg width="18" height="18" className="text-white">
                    <use href="#i-bot" />
                  </svg>
                </div>
                <div>
                  <div className="text-[14.5px] font-bold text-teal-900">Inshuti Assistant</div>
                  <div className="flex items-center gap-[5px] text-xs text-ink-soft">
                    <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#39B08A]" />
                    Anonymous session
                  </div>
                </div>
              </div>
              <div className="ml-auto mt-[14px] max-w-[88%] rounded-2xl rounded-br-[4px] bg-teal-100 px-4 py-[13px] text-sm leading-[1.5] text-teal-900">
                Can I become pregnant during my period?
              </div>
              <div className="mt-[14px] max-w-[88%] rounded-2xl rounded-bl-[4px] bg-paper-2 px-4 py-[13px] text-sm leading-[1.5] text-ink">
                Pregnancy is less likely during menstruation, but still possible depending on the
                timing of ovulation. If you&apos;re concerned, a pregnancy test can help — and it&apos;s
                always okay to speak with a health worker.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-line bg-white px-[13px] py-[7px] text-[12.5px] font-semibold text-teal-700">
                  How ovulation works
                </span>
                <span className="rounded-full border border-line bg-white px-[13px] py-[7px] text-[12.5px] font-semibold text-teal-700">
                  Find a clinic near me
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16" id="topics">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              Popular topics
            </span>
            <h2 className="mt-3 font-display text-4xl text-teal-900">Wherever you&apos;re starting from</h2>
            <p className="mt-3 text-[15.5px] text-ink-soft">
              Six areas young people ask about most — tap one to jump straight into a conversation.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic) => (
              <Link
                href="/chat"
                key={topic.name}
                className="flex cursor-pointer flex-col gap-[14px] rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className={`flex h-[46px] w-[46px] items-center justify-center rounded-[14px] ${topic.bg} ${topic.fg}`}>
                  <svg width="22" height="22">
                    <use href={`#${topic.icon}`} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-teal-900">{topic.name}</h3>
                <p className="text-[13.5px] leading-[1.5] text-ink-soft">{topic.body}</p>
                <span className="mt-auto flex items-center gap-1.5 text-[13px] font-bold text-coral-dark">
                  Ask about this
                  <svg width="13" height="13">
                    <use href="#i-arrow" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              Why Inshuti
            </span>
            <h2 className="mt-3 font-display text-4xl text-teal-900">Built to be trusted</h2>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 text-left shadow-card"
              >
                <div className="mb-[14px] flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <svg width="20" height="20">
                    <use href={`#${feature.icon}`} />
                  </svg>
                </div>
                <h3 className="text-base text-teal-900">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[760px] p-2">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              See it in action
            </span>
            <h2 className="mt-3 font-display text-4xl text-teal-900">Chat preview</h2>
          </div>
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 shadow-card">
            <div className="max-w-full rounded-2xl rounded-br-[4px] bg-teal-100 px-4 py-[13px] text-sm leading-[1.5] text-teal-900">
              Can I become pregnant during my period?
            </div>
            <div className="mt-[14px] max-w-full rounded-2xl rounded-bl-[4px] bg-paper-2 px-4 py-[13px] text-sm leading-[1.5] text-ink">
              Pregnancy is less likely during menstruation, but it is still possible depending on
              the timing of ovulation. If you have concerns about pregnancy, consider taking a
              pregnancy test and consult a healthcare provider.
            </div>
          </div>
        </section>

        <footer className="border-t border-line py-9">
          <div className="flex flex-wrap items-center justify-between gap-[14px]">
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <span className="font-display text-[17px] font-bold text-teal-900">Inshuti</span>
            </div>
            <div className="flex gap-[22px] text-[13.5px] font-semibold text-ink-soft">
              <a href="#" className="hover:text-teal-700">
                Privacy
              </a>
              <a href="#" className="hover:text-teal-700">
                Terms
              </a>
              <a href="/admin/login" className="hover:text-teal-700">
                Admin
              </a>
            </div>
          </div>
          <p className="mt-4 max-w-[640px] text-[12.5px] leading-[1.6] text-ink-soft">
            Inshuti provides general health information and is not a substitute for professional
            medical diagnosis or treatment. If you are in crisis or need urgent care, please
            contact a local health facility or the resources listed in the app.
          </p>
        </footer>
      </div>
    </div>
  );
}
