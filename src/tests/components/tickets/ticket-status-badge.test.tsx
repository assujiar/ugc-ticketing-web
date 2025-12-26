import { render, screen } from "@testing-library/react";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";

describe("TicketStatusBadge Component", () => {
  it("should render open status", () => {
    render(<TicketStatusBadge status="open" />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("should render in_progress status", () => {
    render(<TicketStatusBadge status="in_progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("should render pending status", () => {
    render(<TicketStatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should render resolved status", () => {
    render(<TicketStatusBadge status="resolved" />);
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  it("should render closed status", () => {
    render(<TicketStatusBadge status="closed" />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("should apply info variant for open status", () => {
    const { container } = render(<TicketStatusBadge status="open" />);
    expect(container.firstChild).toHaveClass("bg-blue-500");
  });

  it("should apply warning variant for in_progress status", () => {
    const { container } = render(<TicketStatusBadge status="in_progress" />);
    expect(container.firstChild).toHaveClass("bg-amber-500");
  });

  it("should apply success variant for resolved status", () => {
    const { container } = render(<TicketStatusBadge status="resolved" />);
    expect(container.firstChild).toHaveClass("bg-green-500");
  });

  it("should handle unknown status gracefully", () => {
    render(<TicketStatusBadge status={"unknown" as any} />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});