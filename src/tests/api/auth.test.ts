import { NextRequest } from "next/server";

// Mock modules
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(),
}));

import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { createServerClient } from "@/lib/supabase/server";

describe("Auth API", () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
      };

      const mockProfile = {
        id: "user-1",
        email: "test@example.com",
        full_name: "Test User",
        roles: { name: "super_admin", display_name: "Super Admin" },
        departments: null,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: "token", refresh_token: "refresh" },
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe("test@example.com");
    });

    it("should return error for invalid credentials", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should return validation error for missing email", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          password: "password123",
        }),
      });

      const response = await loginHandler(request);

      expect(response.status).toBe(400);
    });

    it("should return validation error for missing password", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
        }),
      });

      const response = await loginHandler(request);

      expect(response.status).toBe(400);
    });

    it("should return validation error for invalid email format", async () => {
      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: "password123",
        }),
      });

      const response = await loginHandler(request);

      expect(response.status).toBe(400);
    });

    it("should return error for inactive user", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: "user-1" },
          session: { access_token: "token" },
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: "user-1", is_active: false },
        error: null,
      });

      const request = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.message).toContain("deactivated");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const request = new NextRequest("http://localhost/api/auth/logout", {
        method: "POST",
      });

      const response = await logoutHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should handle logout error gracefully", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: "Logout failed" },
      });

      const request = new NextRequest("http://localhost/api/auth/logout", {
        method: "POST",
      });

      const response = await logoutHandler(request);

      // Should still return 200 even if logout has error
      expect(response.status).toBe(200);
    });
  });
});