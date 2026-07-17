// 시스템 소개. toss.im 참고 — 밝은 배경 + 큼직한 볼드 타이포 + 스크롤 리빌 섹션 구성.
// 데모 브랜치: 실제 서비스(대시보드 등)는 아직 공개하지 않아 "실제 서비스 들어가기" 버튼은
// 이동하지 않고 "아직 준비 중입니다" 안내만 보여준다. AI 데모 버튼만 실제로 이동한다.
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHotel, FaChartLine, FaRobot, FaUserTie, FaUser, FaBriefcase } from "react-icons/fa6";
import Reveal from "src/components/common/Reveal";

const AI_FLOW = [
  "AI predicts cancellation probability",
  "LLM turns it into plain-language guidance",
  "Staff reviews and takes action",
];

const TITLE_LINES = ["Hotel cancellations,", "predicted before they happen"];
const CHAR_DELAY_MS = 45;

// 제목을 한 글자씩 순서대로 나타내기 위해, 줄바꿈을 포함한 전체 글자에 순번을 매긴다.
function TypingTitle({ lines }) {
  let charIndex = 0;

  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {[...line].map((char, i) => {
            const delay = charIndex * CHAR_DELAY_MS;
            charIndex += 1;
            return (
              <span
                key={i}
                style={{ animationDelay: `${delay}ms` }}
                className="inline-block animate-char-in"
              >
                {char === " " ? " " : char}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

const MVP_FEATURES = [
  {
    title: "Cancellation risk display",
    desc: "Shows each reservation's cancellation probability as Low/Medium/High (reference only, model accuracy ~78%)",
  },
  {
    title: "Proactive customer management",
    desc: "Suggests confirmation calls, date changes, or upgrades for high-risk reservations",
  },
  {
    title: "Overbooking support",
    desc: "Recommends how many extra bookings to accept based on expected cancellations per date",
  },
];

const STAKEHOLDERS = [
  { title: "Hotel", desc: "Reduces vacancy and revenue loss, improves room operations.", icon: FaHotel },
  { title: "Staff", desc: "Quickly identifies which reservations need attention.", icon: FaUserTie },
  { title: "Guests", desc: "Get flexible options like rescheduling instead of forced cancellation.", icon: FaUser },
  { title: "Management", desc: "Understands cancellation patterns to improve pricing and sales policy.", icon: FaBriefcase },
];

const ROADMAP = [
  {
    stage: "Phase 2",
    items: [
      "Auto-match waitlisted guests / resale prep",
      "Deposit & free-cancellation policy optimization by risk tier",
    ],
  },
  {
    stage: "Phase 3",
    items: [
      "Occupancy & revenue forecast accounting for cancellations",
      "Ops dashboard (correlated factors, not confirmed causes)",
      "Marketing focus on low-cancellation segments/channels",
    ],
  },
];

// "Enter real service" button. This demo branch doesn't expose the real service yet,
// so instead of navigating it just shows a "coming soon" message.
function ComingSoonButton({ className, label = "Enter real service" }) {
  const [clicked, setClicked] = useState(false);

  if (clicked) {
    return (
      <span className={`flex items-center justify-center gap-2 text-slate-400 ${className}`}>
        Coming soon
      </span>
    );
  }

  return (
    <button onClick={() => setClicked(true)} className={className}>
      <FaChartLine className="h-5 w-5" />
      {label}
    </button>
  );
}

function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* 히어로 */}
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-base font-medium text-brand">
          <FaHotel className="h-4 w-4" />
          A B2B decision-support service for hotel operations
        </span>

        {/* 한 글자씩 순서대로 나타남 (글자별 animationDelay는 TypingTitle에서 계산) */}
        <h1 className="mt-7 text-5xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          <TypingTitle lines={TITLE_LINES} />
        </h1>

        {/* 마지막 글자가 다 나타난 뒤 자동으로 나타남 */}
        <p className="mt-7 max-w-2xl animate-fade-in-up text-xl leading-relaxed text-slate-500 [animation-delay:2.6s] sm:text-2xl">
          Using reservation data to predict cancellation likelihood ahead of time, so hotels can
          manage guests proactively and resell rooms strategically to boost occupancy and revenue.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ComingSoonButton className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-brand-dark" />
          <Link
            to="/demo"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-8 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <FaRobot className="h-5 w-5" />
            AI Customer Management Demo
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-2 text-base text-slate-400">
          {AI_FLOW.map((step, index) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 px-4 py-2">{step}</span>
              {index < AI_FLOW.length - 1 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 핵심 기능 (MVP) */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="text-base font-semibold text-brand">Phase 1 MVP</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Core features ready to use today
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            {MVP_FEATURES.map((feature, index) => (
              <Reveal
                key={feature.title}
                delayMs={index * 100}
                className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100"
              >
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2.5 text-base leading-relaxed text-slate-500">{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 이해관계자별 가치 */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="text-base font-semibold text-brand">Why it matters</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Different value for every stakeholder
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {STAKEHOLDERS.map((item, index) => (
              <Reveal
                key={item.title}
                delayMs={index * 100}
                className="rounded-3xl bg-slate-50 p-7"
              >
                <item.icon className="h-6 w-6 text-brand" />
                <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2.5 text-base leading-relaxed text-slate-500">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 로드맵 */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="text-base font-semibold text-brand">Roadmap</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              What's next
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
            {ROADMAP.map((stage, index) => (
              <Reveal
                key={stage.stage}
                delayMs={index * 100}
                className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100"
              >
                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">
                  {stage.stage} · planned
                </span>
                <ul className="mt-4 space-y-2.5 text-base text-slate-500">
                  {stage.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 클로징 */}
      <section className="bg-slate-900 px-4 py-28 text-center text-white sm:px-6">
        <Reveal>
          <blockquote className="mx-auto max-w-2xl text-2xl leading-relaxed font-medium text-slate-100 sm:text-4xl">
            "A decision-support service that predicts cancellation likelihood from reservation
            data, helping hotels boost occupancy and revenue through proactive customer management
            and room resale strategy."
          </blockquote>
          <ComingSoonButton
            label="Get started"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-brand-dark"
          />
        </Reveal>
      </section>
    </div>
  );
}

export default LandingPage;
