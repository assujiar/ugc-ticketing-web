import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { TicketList } from "@/components/tickets/ticket-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tickets | UGC Ticketing",
  description: "View and manage tickets",
};

function TicketListSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="View and manage all tickets in your organization"
        actions={
          <Link href="/tickets/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        }
      />

      <Suspense fallback={<TicketListSkeleton />}>
        <TicketList />
      </Suspense>
    </div>
  );
}