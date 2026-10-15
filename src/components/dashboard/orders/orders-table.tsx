"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { NEXT_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { ApiError } from "@/services/api";
import { updateOrder } from "@/services/order.service";
import { formatPrice } from "@/lib/format";
import type { SerializedOrder } from "@/backend/controllers/order.controller";

function StatusSelect({ status, onChange }: { status: OrderStatus; onChange: (s: OrderStatus) => void }) {
  const options = [status, ...NEXT_STATUSES[status]];
  if (options.length === 1) {
    return <span className="inline-flex h-8 items-center border-2 border-foreground bg-card px-3 text-sm font-bold">{STATUS_LABEL[status]}</span>;
  }
  return (
    <Select value={status} onValueChange={(v) => v && onChange(v as OrderStatus)}>
      <SelectTrigger className="w-44">
        <SelectValue>{STATUS_LABEL[status]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABEL[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const FILTERS: { key: string; label: string; match: (s: OrderStatus) => boolean }[] = [
  { key: "active", label: "Paid & active", match: (s) => ["paid", "shipped", "delivered"].includes(s) },
  { key: "toship", label: "To ship", match: (s) => s === "paid" },
  { key: "unpaid", label: "Unpaid", match: (s) => s === "pending_payment" || s === "failed" },
  { key: "cancelled", label: "Cancelled", match: (s) => s === "cancelled" },
  { key: "all", label: "All", match: () => true },
];

export function OrdersTable({ initialOrders }: { initialOrders: SerializedOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [viewing, setViewing] = useState<SerializedOrder | null>(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState<string | null>(null);
  const shown = orders.filter((o) => FILTERS.find((f) => f.key === filter)!.match(o.status));

  function patch(id: string, changes: Partial<SerializedOrder>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...changes } : o)));
    setViewing((prev) => (prev && prev.id === id ? { ...prev, ...changes } : prev));
  }

  async function setStatus(order: SerializedOrder, status: OrderStatus) {
    if (status === order.status) return;
    setError(null);
    patch(order.id, { status });
    try {
      await updateOrder(order.id, { status });
    } catch (err) {
      patch(order.id, { status: order.status });
      setError(err instanceof ApiError ? err.message : "Could not update the order. Try again.");
    }
  }

  async function saveNote(order: SerializedOrder) {
    setSavingNote(true);
    try {
      await updateOrder(order.id, { trackingNote: note });
      patch(order.id, { trackingNote: note });
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>{shown.length} shown · {orders.length} total (latest 500)</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="group" aria-label="Filter orders" className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </Button>
            ))}
          </div>
          {error && <p role="alert" className="mb-4 border-l-4 border-destructive pl-3 text-sm">{error}</p>}
          {shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">{orders.length === 0 ? "No orders yet." : "No orders in this view."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusSelect status={order.status} onChange={(s) => setStatus(order, s)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewing(order);
                          setNote(order.trackingNote);
                        }}
                      >
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

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>Order {viewing.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <p className="font-medium">{viewing.customer.name}</p>
                  <p className="text-muted-foreground">
                    {viewing.customer.email} · {viewing.customer.phone}
                  </p>
                  <p className="mt-1">
                    {viewing.customer.address}, {viewing.customer.city}, {viewing.customer.state} -{" "}
                    {viewing.customer.pincode}
                  </p>
                </div>
                <ul className="flex flex-col gap-1 border-y py-3">
                  {viewing.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-4">
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{formatPrice(viewing.shipping)}</span>
                  </li>
                  <li className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(viewing.total)}</span>
                  </li>
                </ul>
                {/^(STOCK SHORTAGE|AMOUNT MISMATCH)/.test(viewing.trackingNote) && (
                  <p role="alert" className="border-2 border-destructive bg-card p-3 text-sm font-bold text-destructive">
                    Needs attention — {viewing.trackingNote}
                  </p>
                )}
                {viewing.razorpayPaymentId && (
                  <p className="text-xs text-muted-foreground">
                    Razorpay payment: {viewing.razorpayPaymentId}
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Tracking / note
                  </label>
                  <div className="flex gap-2">
                    <Input value={note} onChange={(e) => setNote(e.target.value)} />
                    <Button disabled={savingNote} onClick={() => saveNote(viewing)}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
