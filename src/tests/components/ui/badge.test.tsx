import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge Component", () => {
  it("should render badge with text", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should apply default variant styles", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-primary");
  });

  it("should apply secondary variant styles", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge).toHaveClass("bg-secondary");
  });

  it("should apply destructive variant styles", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText("Destructive");
    expect(badge).toHaveClass("bg-destructive");
  });

  it("should apply outline variant styles", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge).toHaveClass("text-foreground");
  });

  it("should apply success variant styles", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-green-500");
  });

  it("should apply warning variant styles", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-amber-500");
  });

  it("should apply info variant styles", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge).toHaveClass("bg-blue-500");
  });

  it("should merge custom className", () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-badge");
  });

  it("should render children correctly", () => {
    render(
      <Badge>
        <span data-testid="child">Child Element</span>
      </Badge>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});