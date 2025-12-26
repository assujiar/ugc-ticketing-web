"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { CreateQuoteDialog } from "./create-quote-dialog";
import { useQuotes, useUpdateQuote, useDeleteQuote } from "@/hooks/useQuotes";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  Plus,
  Send,
  Check,
  X,
  Trash2,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { RateQuote } from "@/types";

interface TicketQuotesProps {
  ticketId: string;
  ticketType: string;
  departmentId: string;
}

const statusConfig: Record
  string,
  { label: string; variant: "default" | "secondary" | "success" | "destructive" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function TicketQuotes({ ticketId, ticketType, departmentId }: TicketQuotesProps) {
  const { profile, isManager, isSuperAdmin } = useCurrentUser();
  const { data, isLoading } = useQuotes(ticketId);
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RateQuote | null>(null);

  const quotes: RateQuote[] = data?.data || [];

  // Only RFQ tickets can have quotes
  if (ticketType !== "RFQ") {
    return null;
  }

  const canCreateQuote =
    isSuperAdmin || (isManager && profile?.department_id === departmentId);

  const canManageQuote = (quote: RateQuote) =>
    isSuperAdmin || quote.created_by === profile?.id;

  const handleStatusUpdate = async (quoteId: string, status: string) => {
    await updateQuote.mutateAsync({
      ticketId,
      quoteId,
      data: { status },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteQuote.mutateAsync({
      ticketId,
      quoteId: deleteTarget.id,
    });
    setDeleteTarget(null);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Rate Quotes
          {quotes.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {quotes.length}
            </Badge>
          )}
        </CardTitle>

        {canCreateQuote && (
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Quote
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No quotes yet</p>
            {canCreateQuote && (
              <p className="text-sm">Create a quote to propose a rate.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const config = statusConfig[quote.status] || statusConfig.draft;
              const isExpired = new Date(quote.valid_until) < new Date();

              return (
                <div
                  key={quote.id}
                  className="p-4 rounded-lg bg-muted/50 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {quote.quote_number}
                        </span>
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {isExpired && quote.status === "sent" && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created by {quote.creator?.full_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xl font-bold">
                        <DollarSign className="h-5 w-5" />
                        {formatCurrency(Number(quote.amount), quote.currency).replace(
                          /^\$/,
                          ""
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {quote.currency}
                      </p>
                    </div>
                  </div>

                  {/* Valid until */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={isExpired ? "text-destructive" : ""}>
                      Valid until {formatDate(quote.valid_until)}
                    </span>
                  </div>

                  {/* Terms */}
                  {quote.terms && (
                    <p className="text-sm text-muted-foreground border-l-2 border-muted-foreground/30 pl-3">
                      {quote.terms}
                    </p>
                  )}

                  {/* Actions */}
                  {canManageQuote(quote) && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 flex-wrap">
                        {quote.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(quote.id, "sent")}
                            disabled={updateQuote.isPending}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send to Customer
                          </Button>
                        )}

                        {quote.status === "sent" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-600"
                              onClick={() =>
                                handleStatusUpdate(quote.id, "accepted")
                              }
                              disabled={updateQuote.isPending}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark Accepted
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleStatusUpdate(quote.id, "rejected")
                              }
                              disabled={updateQuote.isPending}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Mark Rejected
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive ml-auto"
                          onClick={() => setDeleteTarget(quote)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create dialog */}
        <CreateQuoteDialog
          ticketId={ticketId}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* Delete confirmation */}
        <ConfirmationDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Delete Quote"
          description={`Are you sure you want to delete quote "${deleteTarget?.quote_number}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={deleteQuote.isPending}
        />
      </CardContent>
    </Card>
  );
}