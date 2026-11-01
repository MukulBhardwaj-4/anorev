import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface SummarizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string | null;
  loading: boolean;
  error: string | null;
}

export function SummarizeModal({
  open,
  onOpenChange,
  summary,
  loading,
  error,
}: SummarizeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Reviews Summary
          </DialogTitle>
          <DialogDescription>
            AI-generated summary of all reviews
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating summary...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">Error</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          )}

          {summary && !loading && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {summary}
              </div>
            </div>
          )}

          {!loading && !error && !summary && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No summary available
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
