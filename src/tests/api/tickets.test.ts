import { NextRequest } from "next/server";

// Mock modules before importing handlers
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  isSuperAdmin: jest.fn(),
  isManager: jest.fn(),
}));

import { GET, POST } from "@/app/api/tickets/route";
import { createServerClient } from "@/lib/supabase/server";
import { requireAuth, isSuperAdmin, isManager } from "@/lib/auth";

describe("Tickets API", () => {
  const mockProfile = {
    id: "user-1",
    email: "test@example.com",
    full_name: "Test User",
    role_id: "role-1",
    department_id: "dept-1",
    roles: { name: "super_admin" },
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);
    (requireAuth as jest.Mock).mockResolvedValue({ user: { id: "user-1" }, profile: mockProfile });
    (isSuperAdmin as jest.Mock).mockReturnValue(true);
    (isManager as jest.Mock).mockReturnValue(false);
  });

  describe("GET /api/tickets", () => {
    it("should return tickets list for authenticated user", async () => {
      const mockTickets = [
        { id: "t1", subject: "Test Ticket 1", status: "open" },
        { id: "t2", subject: "Test Ticket 2", status: "closed" },
      ];

      mockSupabase.range.mockResolvedValue({
        data: mockTickets,
        error: null,
        count: 2,
      });

      const request = new NextRequest("http://localhost/api/tickets");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });

    it("should return 401 for unauthenticated user", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        error: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }),
      });

      const request = new NextRequest("http://localhost/api/tickets");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should filter tickets by status", async () => {
      mockSupabase.range.mockResolvedValue({
        data: [{ id: "t1", status: "open" }],
        error: null,
        count: 1,
      });

      const request = new NextRequest("http://localhost/api/tickets?status=open");
      await GET(request);

      expect(mockSupabase.eq).toHaveBeenCalledWith("status", "open");
    });

    it("should filter tickets by department", async () => {
      mockSupabase.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const request = new NextRequest("http://localhost/api/tickets?department_id=dept-1");
      await GET(request);

      expect(mockSupabase.eq).toHaveBeenCalledWith("department_id", "dept-1");
    });

    it("should paginate results", async () => {
      mockSupabase.range.mockResolvedValue({
        data: [],
        error: null,
        count: 100,
      });

      const request = new NextRequest("http://localhost/api/tickets?page=2&pageSize=10");
      const response = await GET(request);
      const data = await response.json();

      expect(mockSupabase.range).toHaveBeenCalledWith(10, 19);
      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(10);
    });

    it("should handle database errors", async () => {
      mockSupabase.range.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
        count: 0,
      });

      const request = new NextRequest("http://localhost/api/tickets");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/tickets", () => {
    const validTicketData = {
      ticket_type: "GEN",
      subject: "Test Ticket",
      description: "Test description",
      department_id: "dept-1",
      priority: "medium",
    };

    it("should create a new ticket", async () => {
      const createdTicket = {
        id: "new-ticket-id",
        ticket_code: "GENMKT010126001",
        ...validTicketData,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: createdTicket,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/tickets", {
        method: "POST",
        body: JSON.stringify(validTicketData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.ticket_code).toBeDefined();
    });

    it("should return validation error for missing required fields", async () => {
      const invalidData = {
        ticket_type: "GEN",
        // missing subject, description, department_id
      };

      const request = new NextRequest("http://localhost/api/tickets", {
        method: "POST",
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should return validation error for invalid ticket type", async () => {
      const invalidData = {
        ...validTicketData,
        ticket_type: "INVALID",
      };

      const request = new NextRequest("http://localhost/api/tickets", {
        method: "POST",
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should create RFQ ticket with rfq_data", async () => {
      const rfqData = {
        ticket_type: "RFQ",
        subject: "Rate Inquiry",
        description: "Need quote",
        department_id: "dept-1",
        priority: "high",
        rfq_data: {
          customer_name: "Test Customer",
          origin_city: "Jakarta",
          destination_city: "Singapore",
          service_type: "FCL",
          cargo_category: "Genco",
          cargo_description: "Electronics",
          origin_address: "Address 1",
          origin_country: "Indonesia",
          destination_address: "Address 2",
          destination_country: "Singapore",
          quantity: 10,
          unit_of_measure: "boxes",
          weight_per_unit: 25,
          length: 100,
          width: 50,
          height: 50,
          volume_per_unit: 0.25,
          total_volume: 2.5,
          scope_of_work: "Door to door delivery",
        },
      };

      mockSupabase.rpc.mockResolvedValue({
        data: { id: "rfq-ticket", ...rfqData },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/tickets", {
        method: "POST",
        body: JSON.stringify(rfqData),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});