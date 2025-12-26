import { render, screen } from "@testing-library/react";
import { TicketPriorityBadge } from "@/components/tickets/ticket-priority-badge";

describe("TicketPriorityBadge Component", () => {
  it("should render urgent priority", () => {
    render(<TicketPriorityBadge priority="urgent" />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("should render high priority", () => {
    render(<TicketPriorityBadge priority="high" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("should render medium priority", () => {
    render(<TicketPriorityBadge priority="medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("should render low priority", () => {
    render(<TicketPriorityBadge priority="low" />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("should apply destructive variant for urgent", () => {
    const { container } = render(<TicketPriorityBadge priority="urgent" />);
    expect(container.firstChild).toHaveClass("bg-destructive");
  });

  it("should apply warning variant for high", () => {
    const { container } = render(<TicketPriorityBadge priority="high" />);
    expect(container.firstChild).toHaveClass("bg-amber-500");
  });

  it("should show icon by default", () => {
    render(<TicketPriorityBadge priority="urgent" />);
    // Icon should be present (AlertTriangle for urgent)
    const badge = screen.getByText("Urgent").parentElement;
    expect(badge?.querySelector("svg")).toBeInTheDocument();
  });

  it("should hide icon when showIcon is false", () => {
    render(<TicketPriorityBadge priority="urgent" showIcon={false} />);
    const badge = screen.getByText("Urgent");
    expect(badge.querySelector("svg")).not.toBeInTheDocument();
  });

  it("should handle unknown priority gracefully", () => {
    render(<TicketPriorityBadge priority={"unknown" as any} />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});