import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { getBooks } from "@/backend/controllers/book.controller";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Books", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardBooksPage() {
  const books = await getBooks();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Books</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage titles, prices, stock and images.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/books/add" />}>
          <Plus className="size-4" />
          Add book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All books</CardTitle>
          <CardDescription>{books.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-sm text-muted-foreground">No books yet. Add your first one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => {
                  const id = String(book._id);
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded border bg-muted">
                            {book.images[0] && (
                              <Image src={book.images[0]} alt="" fill sizes="40px" className="object-cover" unoptimized />
                            )}
                          </div>
                          <span className="font-medium">{book.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(book.price)}</TableCell>
                      <TableCell>{book.stock}</TableCell>
                      <TableCell className="space-x-1">
                        <Badge variant={book.published ? "default" : "outline"}>
                          {book.published ? "Published" : "Draft"}
                        </Badge>
                        {book.featured && <Badge variant="secondary">Featured</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/dashboard/books/${id}/edit`} />}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <ConfirmDeleteButton
                            kind="book"
                            id={id}
                            itemLabel={book.title}
                            description="This permanently removes the book from the store. Past orders are kept."
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
