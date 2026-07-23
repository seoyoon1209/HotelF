// System introduction page. Inspired by toss.im — light background + large bold typography + scroll-reveal sections.
import { Link } from "react-router-dom";
import { FaHotel, FaChartLine, FaRobot, FaUserTie, FaUser, FaBriefcase } from "react-icons/fa6";
import Reveal from "src/components/common/Reveal";

const AI_FLOW = ["AI predicts cancellation probability", "LLM converts it into an easy-to-understand sentence", "Staff review and take final action"];

const TITLE_LINES = ["Hoteling"];
const CHAR_DELAY_MS = 55;

// Assigns a sequence number to every character (including line breaks) so the title can appear one character at a time.
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
  { title: "Cancellation Risk Display", desc: "Shows each reservation's cancellation probability as Low, Medium, or High (for reference only, model accuracy roughly 78%)" },
  { title: "Proactive Guest Care", desc: "Suggests actions for high-risk reservations, such as a follow-up call, date change, or upgrade" },
  { title: "Overbooking Support", desc: "Recommends an allowable range for additional bookings based on expected cancellations by date" },
];

const STAKEHOLDERS = [
  { title: "Hotel", desc: "Reduces vacancy and lost revenue while improving room operations efficiency.", icon: FaHotel },
  { title: "Staff", desc: "Quickly identifies which reservations need priority attention.", icon: FaUserTie },
  { title: "Guest", desc: "Offers more flexible options, like a date change, instead of a forced cancellation.", icon: FaUser },
  { title: "Management", desc: "Understands the causes of cancellations through data to improve pricing, sales, and reservation policy.", icon: FaBriefcase },
];

const ROADMAP = [
  {
    stage: "Phase 2",
    items: ["Automatic waitlist matching / resale preparation", "Optimized pricing and refund policy (deposit and free-cancellation windows tiered by risk level)"],
  },
  {
    stage: "Phase 3",
    items: [
      "Predicting actual occupancy and revenue net of cancellations",
      "Operations dashboard (risk factors are correlations only, not causes)",
      "Improved marketing efficiency targeting low-cancellation customer groups and channels",
    ],
  },
];

function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* Hero */}
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-base font-medium text-brand">
          <FaHotel className="h-4 w-4" />
          A B2B decision-support service for hotel operations
        </span>

        {/* Appears one character at a time (per-character animationDelay is computed in TypingTitle) */}
        <h1 className="mt-7 text-5xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          <TypingTitle lines={TITLE_LINES} />
        </h1>

        {/* Appears automatically once the last character has finished animating in */}
        <p className="mt-7 max-w-2xl animate-fade-in-up text-xl leading-relaxed text-slate-500 [animation-delay:1.75s] sm:text-2xl">
          A decision-support service that uses reservation data to predict guest cancellations in
          advance, and increases hotel occupancy and revenue through proactive guest care and room
          resale strategies.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-brand-dark"
          >
            <FaChartLine className="h-5 w-5" />
            Go to the Live Service
          </Link>
          <Link
            to="/prediction"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-8 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <FaRobot className="h-5 w-5" />
            Cancellation Prediction AI Demo
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

      {/* Core features (MVP) */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="text-base font-semibold text-brand">Phase 1 MVP</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Core Features Ready to Use Now
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

      {/* Value by stakeholder */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="text-base font-semibold text-brand">Why it matters</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Delivering different value to each stakeholder
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

      {/* Roadmap */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="text-base font-semibold text-brand">Roadmap</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              What's Next
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
                  {stage.stage}
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

      {/* Closing */}
      <section className="bg-slate-900 px-4 py-28 text-center text-white sm:px-6">
        <Reveal>
          <blockquote className="mx-auto max-w-2xl text-2xl leading-relaxed font-medium text-slate-100 sm:text-4xl">
            "A decision-support service that uses reservation data to predict guest cancellations
            in advance, and increases hotel occupancy and revenue through proactive guest care and
            room resale strategies"
          </blockquote>
          <Link
            to="/dashboard"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-brand-dark"
          >
            <FaChartLine className="h-5 w-5" />
            Get Started Now
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

export default LandingPage;
