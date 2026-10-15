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
import { updateOrder } from "@/services/order.service";
import { formatPrice } from "@/lib/format";
import type { SerializedOrder } from "@/backend/controllers/order.controller";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

function StatusSelect({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  return (
    <Select value={status} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-40">
        <SelectValue>{STATUS_LABEL[status] ?? status}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OrdersTable({ initialOrders }: { initialOrders: SerializedOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [viewing, setViewing] = useState<SerializedOrder | null>(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  function patch(id: string, changes: Partial<SerializedOrder>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...changes } : o)));
    setViewing((prev) => (prev && prev.id === id ? { ...prev, ...changes } : prev));
  }

  async function setStatus(order: SerializedOrder, status: string) {
    if (status === order.status) return;
    patch(order.id, { status: status as SerializedOrder["status"] });
    try {
      await updateOrder(order.id, { status });
    } catch {
      patch(order.id, { status: order.status });
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
          <CardDescription>{orders.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
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
                {orders.map((order) => (
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
