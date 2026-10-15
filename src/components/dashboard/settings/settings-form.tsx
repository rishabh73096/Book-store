"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/form-field";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "@/services/settings.service";
import { ApiError } from "@/services/api";
import type { SettingsInput } from "@/lib/validations/settings";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function set<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }
  const text = (key: keyof SettingsInput) => ({
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key, e.target.value as never),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateSettings(values);
      setMessage({ ok: true, text: "Saved." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Home page</CardTitle>
          <CardDescription>Heading and intro shown at the top of the home page.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Field label="Author name">
            <Input placeholder="e.g. Anita Sharma" {...text("authorName")} />
          </Field>
          <Field label="Tagline">
            <Input placeholder="A short line under your name" {...text("tagline")} />
          </Field>
          <Field label="Hero heading">
            <Input placeholder="A memorable headline" {...text("heroHeading")} />
          </Field>
          <Field label="Hero text">
            <Textarea rows={3} placeholder="Two or three sentences" {...text("heroText")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ImageUploadField
            label="Author photo"
            value={values.authorImage}
            onChange={(url) => set("authorImage", url)}
            previewAspect="portrait"
            recommendedDimensions="800 × 1000 px"
          />
          <Field label="Title">
            <Input placeholder="About the author" {...text("aboutTitle")} />
          </Field>
          <Field label="Short bio (home page, 2–3 sentences)">
            <Textarea rows={3} placeholder="Two or three sentences" {...text("shortBio")} />
          </Field>
          <Field label="Personal statement / message (one strong paragraph)">
            <Textarea rows={4} placeholder="One honest paragraph" {...text("statement")} />
          </Field>
          <Field label="Biography (blank line = new paragraph)">
            <Textarea rows={8} placeholder="Your story" {...text("aboutBody")} />
          </Field>
          <Field label="Writing journey & milestones (blank line = new paragraph; only verified facts)">
            <Textarea rows={8} placeholder="Only verified facts" {...text("writingJourney")} />
          </Field>
          <Field label="Influences">
            <Textarea rows={4} placeholder="Writers and places that shaped you" {...text("influences")} />
          </Field>
          <Field label="Inside the books — themes, genres, who they are for (blank line = new paragraph)">
            <Textarea rows={6} placeholder="Themes, genres, who the books are for" {...text("insideBooks")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact & social</CardTitle>
          <CardDescription>Shown on the contact page and footer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
          <Field label="Email">
            <Input type="email" placeholder="hello@example.com" {...text("email")} />
          </Field>
          <Field label="Phone">
            <Input placeholder="+91 98765 43210" {...text("phone")} />
          </Field>
          <Field label="WhatsApp number (with country code, digits only)">
            <Input placeholder="919876543210" {...text("whatsapp")} />
          </Field>
          <Field label="Address">
            <Input placeholder="City, State" {...text("address")} />
          </Field>
          <Field label="Facebook URL">
            <Input placeholder="https://facebook.com/…" {...text("facebook")} />
          </Field>
          <Field label="Instagram URL">
            <Input placeholder="https://instagram.com/…" {...text("instagram")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
          <Field label="Shipping charge (₹)">
            <Input
              type="number"
              min={0}
              value={values.shippingCharge}
              onChange={(e) => set("shippingCharge", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Free shipping above (₹, 0 = never)">
            <Input
              type="number"
              min={0}
              value={values.freeShippingAbove}
              onChange={(e) => set("freeShippingAbove", Number(e.target.value) || 0)}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {message && (
          <span className={message.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
