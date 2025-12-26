import { PageHeader } from "@/components/common/page-header";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export const metadata = {
  title: "Create Ticket | UGC Ticketing",
  description: "Create a new ticket",
};

export default function CreateTicketPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Ticket"
        description="Submit a rate inquiry or general request"
      />

      <CreateTicketForm />
    </div>
  );
}