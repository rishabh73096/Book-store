// Re-mounts on every navigation, giving each route a short fade-and-rise entrance.
// Reduced-motion users get no animation (see .rise-in in globals.css).
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="rise-in" style={{ "--d": "0ms" } as React.CSSProperties}>{children}</div>;
}
