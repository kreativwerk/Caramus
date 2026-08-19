export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 select-none">
      <svg width="26" height="18" viewBox="0 0 26 18" aria-hidden className="self-center">
        <path d="M1 13 Q9 3 25 6" fill="none" stroke="#2fb5b3" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M1 16 Q10 7 25 10" fill="none" stroke={dark ? "#ffffff" : "#132b54"} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className={`text-lg font-bold tracking-wide ${dark ? "text-white" : "text-navy-800"}`}>
        CURAMUS
      </span>
      <span className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${dark ? "text-teal-400" : "text-teal-600"}`}>
        Medical
      </span>
    </span>
  );
}
