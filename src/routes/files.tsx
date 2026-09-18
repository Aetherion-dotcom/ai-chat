import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, FileText, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FILES, formatBytes, formatDate } from "@/data/mock";
import type { FileItem } from "@/types/chat";
import { toast } from "sonner";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "File library — AI Chat" },
      {
        name: "description",
        content: "Search, sort and preview every file shared across your AI Chat conversations.",
      },
      { property: "og:title", content: "File library — AI Chat" },
      {
        property: "og:description",
        content: "Search, sort and preview every file shared across your AI Chat conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FilesPage,
});

type SortKey = "recent" | "name" | "size";

function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>(FILES);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FileItem | null>(null);

  const types = useMemo(() => ["all", ...Array.from(new Set(files.map((f) => f.type)))], [files]);

  const visible = useMemo(() => {
    const list = files
      .filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))
      .filter((f) => type === "all" || f.type === type);
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "size") return b.size - a.size;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [files, query, type, sort]);

  return (
    <>
      <PageHeader title="Files" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files"
                aria-label="Search files"
                className="pl-8"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Filter by type" className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "All types" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger aria-label="Sort files" className="sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="size">Largest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <FileText className="mx-auto size-6 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm font-medium">No files found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                    <TableHead className="hidden lg:table-cell">Conversation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{f.type}</TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {formatBytes(f.size)}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {formatDate(f.uploadedAt)}
                      </TableCell>
                      <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                        {f.conversation}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Preview ${f.name}`}
                          className="size-8 text-muted-foreground"
                          onClick={() => setPreview(f)}
                        >
                          <Eye className="size-4" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${f.name}`}
                          className="size-8 text-muted-foreground"
                          onClick={() => setPendingDelete(f)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>
              {preview?.type} · {preview ? formatBytes(preview.size) : ""} ·{" "}
              {preview ? formatDate(preview.uploadedAt) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
            Preview not available in this prototype
          </div>
          <p className="text-xs text-muted-foreground">
            Shared in “{preview?.conversation}”
          </p>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.name}” will be removed from your library. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  setFiles((prev) => prev.filter((f) => f.id !== pendingDelete.id));
                  toast.success("File deleted");
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
