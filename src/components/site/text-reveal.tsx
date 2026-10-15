export function TextReveal({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="group/reveal relative inline-block overflow-hidden align-bottom"
      style={{ height: "1.4em" }}
    >
      <span
        className="block transition-transform duration-350 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/reveal:-translate-y-full"
        style={{ lineHeight: "1.4em" }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-full block transition-transform duration-350 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/reveal:-translate-y-full"
        style={{ lineHeight: "1.4em" }}
      >
        {children}
      </span>
    </span>
  );
}
