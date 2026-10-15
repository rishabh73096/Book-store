"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateContactStatus,
  type ContactMessage,
  type ContactStatus,
} from "@/services/contact.service";

const statusLabel: Record<ContactStatus, string> = {
  pending: "Pending",
  resolved: "Resolved",
  rejected: "Rejected",
};

function StatusSelect({
  status,
  onChange,
}: {
  status: ContactStatus;
  onChange: (status: ContactStatus) => void;
}) {
  return (
    <Select value={status} onValueChange={(value) => onChange(value as ContactStatus)}>
      <SelectTrigger className="w-32">
        <SelectValue>{statusLabel[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ContactTable({
  initialMessages,
  total,
}: {
  initialMessages: ContactMessage[];
  total: number;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [viewing, setViewing] = useState<ContactMessage | null>(null);

  async function setStatus(message: ContactMessage, nextStatus: ContactStatus) {
    if (nextStatus === message.status) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status: nextStatus } : m))
    );
    setViewing((prev) => (prev && prev.id === message.id ? { ...prev, status: nextStatus } : prev));
    try {
      await updateContactStatus(message.id, nextStatus);
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, status: message.status } : m))
      );
      setViewing((prev) =>
        prev && prev.id === message.id ? { ...prev, status: message.status } : prev
      );
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Queries</CardTitle>
          <CardDescription>{total} total</CardDescription>
        </CardHeader>
        <CardContent className="min-h-100">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      {message.firstName} {message.lastName}
                    </TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(message.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusSelect
                        status={message.status}
                        onChange={(next) => setStatus(message, next)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setViewing(message)}>
                        <Eye className="size-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewing ? `${viewing.firstName} ${viewing.lastName}` : "Query"}
            </DialogTitle>
            <DialogDescription>{viewing?.email}</DialogDescription>
          </DialogHeader>

          {viewing && (
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Phone
                </p>
                <p className="mt-1">{viewing.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Query
                </p>
                <p className="mt-1 whitespace-pre-wrap">{viewing.message}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Received
                </p>
                <p className="mt-1">
                  {new Date(viewing.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Status
                </p>
                <div className="mt-1">
                  <StatusSelect
                    status={viewing.status}
                    onChange={(next) => setStatus(viewing, next)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
