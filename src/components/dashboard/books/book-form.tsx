"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FieldLabel } from "@/components/ui/form-field";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";
import { createBook, updateBook } from "@/services/book.service";
import { ApiError } from "@/services/api";
import { slugify } from "@/lib/format";
import type { BookInput } from "@/lib/validations/book";

const EMPTY: BookInput = {
  title: "",
  slug: "",
  author: "",
  description: "",
  shortDescription: "",
  excerpt: "",
  format: "",
  price: 0,
  mrp: 0,
  images: [],
  stock: 0,
  isbn: "",
  language: "English",
  pages: 0,
  category: "",
  featured: false,
  published: true,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function BookForm({ bookId, initial }: { bookId?: string; initial?: BookInput }) {
  const router = useRouter();
  const [values, setValues] = useState<BookInput>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const num = (value: string) => (value === "" ? 0 : Number(value) || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Blank image slots (added but never uploaded) are dropped before saving.
      const payload = { ...values, images: values.images.filter(Boolean) };
      if (bookId) await updateBook(bookId, payload);
      else await createBook(payload);
      router.push("/dashboard/books");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-7">
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <Field label="Title">
          <Input
            required
            placeholder="e.g. The Quiet Hours" value={values.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug (URL)">
          <Input
            required
            placeholder="the-quiet-hours" value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
          />
        </Field>
        <Field label="Author">
          <Input placeholder="Author name" value={values.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
        <Field label="Category">
          <Input placeholder="e.g. Poetry" value={values.category} onChange={(e) => set("category", e.target.value)} />
        </Field>
        <Field label="Selling price (₹)">
          <Input
            type="number"
            min={0}
            required
            placeholder="e.g. 399"
            value={values.price}
            onChange={(e) => set("price", num(e.target.value))}
          />
        </Field>
        <Field label="MRP (₹, optional)">
          <Input
            type="number"
            min={0}
            value={values.mrp}
            onChange={(e) => set("mrp", num(e.target.value))}
          />
        </Field>
        <Field label="Stock">
          <Input
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => set("stock", Math.trunc(num(e.target.value)))}
          />
        </Field>
        <Field label="Pages">
          <Input
            type="number"
            min={0}
            value={values.pages}
            onChange={(e) => set("pages", Math.trunc(num(e.target.value)))}
          />
        </Field>
        <Field label="Language">
          <Input placeholder="English" value={values.language} onChange={(e) => set("language", e.target.value)} />
        </Field>
        <Field label="ISBN">
          <Input placeholder="Only if you have one" value={values.isbn} onChange={(e) => set("isbn", e.target.value)} />
        </Field>
      </div>

      <Field label="Short description (one or two lines, shown on cards)">
        <Textarea
          rows={2}
          placeholder="One or two lines shown on book cards"
          maxLength={300}
          value={values.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
        />
      </Field>

      <Field label="Format (e.g. Paperback)">
        <Input value={values.format} onChange={(e) => set("format", e.target.value)} />
      </Field>

      <Field label="Description / synopsis">
        <Textarea
          rows={6}
          placeholder="What is the book about?"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <Field label="Excerpt (only text you have the right to publish)">
        <Textarea
          rows={6}
          placeholder="A short passage you have the right to publish"
          value={values.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <FieldLabel>Images (first one is the cover)</FieldLabel>
        {values.images.map((url, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <ImageUploadField
                value={url}
                previewAspect="portrait"
                recommendedDimensions="600 × 800 px"
                onChange={(next) =>
                  set(
                    "images",
                    values.images.map((u, idx) => (idx === i ? next : u))
                  )
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Remove image"
              onClick={() =>
                set(
                  "images",
                  values.images.filter((_, idx) => idx !== i)
                )
              }
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        {values.images.length < 10 && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set("images", [...values.images, ""])}
            >
              <Plus className="size-4" />
              Add image
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={values.published} onCheckedChange={(v) => set("published", v)} />
          Published (visible on website)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} />
          Featured on home page
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : bookId ? "Save changes" : "Add book"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/books")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
