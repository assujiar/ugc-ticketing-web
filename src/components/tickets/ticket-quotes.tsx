"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotes } from "@/hooks/useQuotes";
import { CreateQuoteDialog } from "./create-quote-dialog";
import { formatCurrency } from "@/lib/utils";
import { Plus, FileText, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import type { RateQuote, QuoteStatus } from "@/types";

interface TicketQuotesProps {
  ticketId: string;
  canCreateQuote?: boolean;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const statusConfig: Record<QuoteStatus, StatusConfig> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "info" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function TicketQuotes({ ticketId, canCreateQuote = false }: TicketQuotesProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: quotes, isLoading } = useQuotes(ticketId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Quotes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rate Quotes</CardTitle>
            <CardDescription>
              {quotes?.length || 0} quote(s) for this ticket
            </CardDescription>
          </div>
          {canCreateQuote && (
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!quotes || quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No quotes yet
            </p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote: RateQuote) => {
                const config = statusConfig[quote.status] || { label: quote.status, variant: "default" as BadgeVariant };
                
                return (
                  <div
                    key={quote.id}
                    className="flex items-start justify-between border rounded-lg p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {quote.quote_number}
                        </span>
                        <Badge variant={config.variant} className="gap-1">
                          {getStatusIcon(quote.status)}
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(quote.amount, quote.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Valid until: {format(new Date(quote.valid_until), "PPP")}
                      </p>
                      {quote.terms && (
                        <p className="text-sm text-muted-foreground">
                          Terms: {quote.terms}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Created by {quote.creator?.full_name}</p>
                      <p>{format(new Date(quote.created_at), "PPp")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateQuoteDialog
        ticketId={ticketId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}
