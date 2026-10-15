import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubscribers } from "@/backend/controllers/newsletter.controller";

export const metadata: Metadata = { title: "Subscribers", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscribers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Readers who joined the newsletter.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
          <CardDescription>{subscribers.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscribers yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={String(s._id)}>
                    <TableCell>{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.subscribedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
