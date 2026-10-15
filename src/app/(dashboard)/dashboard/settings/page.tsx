import type { Metadata } from "next";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { getSettings } from "@/backend/controllers/settings.controller";

export const metadata: Metadata = { title: "Site Content", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Site Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit home, about, contact details, social links and shipping.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
