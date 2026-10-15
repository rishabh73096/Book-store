"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError } from "@/services/api";
import { deleteBook } from "@/services/book.service";

type DeleteKind = "book";

// A function prop can't cross the Server -> Client boundary, so this takes a plain
// `kind` string instead and looks up which service call to make internally.
const DELETE_HANDLERS: Record<DeleteKind, (id: string) => Promise<unknown>> = {
  book: deleteBook,
};

// Shared delete-confirmation used across dashboard list pages so the confirm/loading/error UX stays consistent.
export function ConfirmDeleteButton({
  kind,
  id,
  itemLabel,
  description,
}: {
  kind: DeleteKind;
  id: string;
  itemLabel: string;
  description: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await DELETE_HANDLERS[kind](id);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Trash2 className="size-4" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{itemLabel}&rdquo;?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" disabled={loading} onClick={handleDelete}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
