// 시스템 소개. toss.im 참고 — 밝은 배경 + 큼직한 볼드 타이포 + 스크롤 리빌 섹션 구성.
import { Link } from "react-router-dom";
import { FaHotel, FaChartLine, FaRobot, FaUserTie, FaUser, FaBriefcase } from "react-icons/fa6";
import Reveal from "src/components/common/Reveal";

const AI_FLOW = ["AI가 취소 확률을 예측", "LLM이 사람이 이해하기 쉬운 문장으로 변환", "직원이 최종 확인 후 실행"];

const TITLE_LINES = ["호텔 예약 취소,", "미리 알면 막을 수 있습니다"];
const CHAR_DELAY_MS = 55;

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
                {char === " " ? " " : char}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

const MVP_FEATURES = [
  { title: "취소 위험도 표시", desc: "예약별 취소 확률을 낮음·보통·높음으로 표시 (참고용, 모델 정확도 약 78%)" },
  { title: "선제적 고객 관리", desc: "고위험 예약에 재확인 연락·일정 변경·업그레이드 등 조치를 제안" },
  { title: "오버부킹 지원", desc: "날짜별 예상 취소량을 기반으로 추가 예약 허용 범위를 추천" },
];

const STAKEHOLDERS = [
  { title: "호텔", desc: "공실과 매출 손실을 줄이고 객실 운영 효율을 높입니다.", icon: FaHotel },
  { title: "직원", desc: "관리가 필요한 예약의 우선순위를 빠르게 파악할 수 있습니다.", icon: FaUserTie },
  { title: "고객", desc: "강제 취소 대신 일정 변경 등 더 유연한 선택지를 제공받습니다.", icon: FaUser },
  { title: "경영진", desc: "취소 원인을 데이터로 파악해 가격·판매·예약 정책을 개선합니다.", icon: FaBriefcase },
];

const ROADMAP = [
  {
    stage: "2단계",
    items: ["대기 고객 자동 연결 / 재판매 준비", "가격·환불 정책 최적화 (위험도별 보증금·무료취소 기한 차등)"],
  },
  {
    stage: "3단계",
    items: [
      "취소 반영 실질 점유율·매출 예측",
      "운영 대시보드 (위험 요인은 상관관계일 뿐 원인은 아님)",
      "취소율 낮은 고객군·채널 대상 마케팅 효율 개선",
    ],
  },
];

function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* 히어로 */}
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-base font-medium text-brand">
          <FaHotel className="h-4 w-4" />
          호텔 운영을 위한 B2B 의사결정 지원 서비스
        </span>

        {/* 한 글자씩 순서대로 나타남 (글자별 animationDelay는 TypingTitle에서 계산) */}
        <h1 className="mt-7 text-5xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          <TypingTitle lines={TITLE_LINES} />
        </h1>

        {/* 마지막 글자가 다 나타난 뒤 자동으로 나타남 */}
        <p className="mt-7 max-w-2xl animate-fade-in-up text-xl leading-relaxed text-slate-500 [animation-delay:1.75s] sm:text-2xl">
          예약 데이터를 활용해 고객의 취소 가능성을 사전에 예측하고, 적절한 고객 관리와 객실
          재판매 전략을 통해 호텔의 점유율과 매출을 높이는 의사결정 지원 서비스입니다.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-brand-dark"
          >
            <FaChartLine className="h-5 w-5" />
            실제 서비스 들어가기
          </Link>
          <Link
            to="/prediction"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-8 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <FaRobot className="h-5 w-5" />
            취소 예측 AI 데모
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
            <span className="text-base font-semibold text-brand">1단계 MVP</span>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              지금 바로 쓸 수 있는 핵심 기능
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
              이해관계자별로 다른 가치를 전달합니다
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
              앞으로의 계획
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
                  {stage.stage} 예정
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
            "예약 데이터를 활용해 고객의 취소 가능성을 사전에 예측하고, 적절한 고객 관리와 객실
            재판매 전략을 통해 호텔의 점유율과 매출을 높이는 의사결정 지원 서비스"
          </blockquote>
          <Link
            to="/dashboard"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-brand-dark"
          >
            <FaChartLine className="h-5 w-5" />
            지금 시작하기
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

export default LandingPage;
