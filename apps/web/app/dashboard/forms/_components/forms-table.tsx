"use client"

import Link from "next/link"
import { FileTextIcon, PencilIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { useListForms } from "~/hooks/api/form"

export function FormsTable() {
  const { forms, isLoading, isError, error } = useListForms()

  if (isLoading) {
    return <FormsTableSkeleton />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-destructive">
          {error?.message ?? "Failed to load forms."}
        </p>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <FileTextIcon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No forms yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first form to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="hover:underline"
                >
                  {form.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {form.description || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={form.isActive ? "default" : "secondary"}>
                  {form.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {form.createdAt
                  ? new Date(form.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <PencilIcon />
                    <span className="sr-only">Edit {form.title}</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function FormsTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
