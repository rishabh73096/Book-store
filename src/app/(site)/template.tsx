// Re-mounts on every navigation: a short fade so route changes feel soft. No movement, so the
// page never shifts or "lands" while it is being read. Disabled for reduced-motion users.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
