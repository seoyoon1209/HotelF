// Tailwind 설정. 커스텀 색상/폰트 등 디자인 토큰은 theme.extend에 추가.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 토스 스타일 참고용 포인트 블루
        brand: {
          DEFAULT: "#3182f6",
          dark: "#1b64da",
        },
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "char-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        // fill-mode: both → animation-delay로 미룬 구간에도 시작 상태(투명)를 유지
        "fade-in-up": "fade-in-up 0.7s ease-out both",
        // 제목 한 글자씩 순서대로 나타나는 효과 (글자마다 animationDelay를 다르게 줘서 사용)
        "char-in": "char-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
