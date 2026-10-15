"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { uploadImage } from "@/services/upload.service";
import { ApiError } from "@/services/api";

export interface ImageUploadFieldProps {
  label?: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  recommendedDimensions?: string;
  maxSizeMb?: number;
  helperText?: string;
  previewAspect?: "portrait" | "landscape" | "square" | "video";
}

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  recommendedDimensions = "800 × 600 px (4:3)",
  maxSizeMb = 5,
  helperText,
  previewAspect = "landscape",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const aspectClass =
    previewAspect === "portrait"
      ? "aspect-[4/5] w-24"
      : previewAspect === "square"
      ? "size-24"
      : previewAspect === "video"
      ? "aspect-video w-36"
      : "aspect-[4/3] w-28";

  async function handleFile(file: File) {
    setError(null);
    setSuccessMsg(null);

    // Validate size limit
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the ${maxSizeMb}MB limit. Please upload an image under ${maxSizeMb}MB.`
      );
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url);
      setSuccessMsg("Uploaded to Cloudinary successfully!");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload to Cloudinary failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">{label}</label>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      )}

      {/* Preview and Upload Action */}
      <div className="flex items-center gap-4">
        <div className={`relative ${aspectClass} shrink-0 overflow-hidden rounded-md border bg-muted`}>
          {value ? (
            <Image
              src={value}
              alt={label || "Preview"}
              fill
              className="object-cover"
              sizes="120px"
              unoptimized={value.startsWith("http")}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {recommendedDimensions && (
              <Badge variant="secondary" className="text-[11px] font-medium">
                {recommendedDimensions}
              </Badge>
            )}
            <Badge variant="outline" className="text-[11px]">
              Max {maxSizeMb}MB
            </Badge>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = "";
            }}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Uploading to Cloudinary…
              </>
            ) : (
              <>
                <UploadCloud className="size-3.5" />
                {value ? "Replace image" : "Upload to Cloudinary"}
              </>
            )}
          </Button>

          {helperText && <p className="text-[11px] text-muted-foreground">{helperText}</p>}
        </div>
      </div>

      {/* Manual URL input option */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Or paste Image URL:</label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/... or https://res.cloudinary.com/..."
          className="text-xs"
        />
      </div>

      {/* Notifications */}
      {successMsg && (
        <p className="text-xs font-medium text-green-600 dark:text-green-400">{successMsg}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
