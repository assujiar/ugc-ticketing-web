import {
  hasPermission,
  canViewTicket,
  canUpdateTicket,
  canDeleteTicket,
  canAssignTicket,
  canCreateQuote,
  canViewDashboard,
  canManageUsers,
  PERMISSIONS,
} from "@/lib/permissions";

// Mock user profiles
const superAdmin = {
  id: "1",
  roles: { name: "super_admin" },
  department_id: null,
};

const marketingManager = {
  id: "2",
  roles: { name: "marketing_manager" },
  department_id: "dept-mkt",
};

const salesperson = {
  id: "3",
  roles: { name: "salesperson" },
  department_id: "dept-sal",
};

const opsManager = {
  id: "4",
  roles: { name: "domestics_ops_manager" },
  department_id: "dept-dom",
};

describe("hasPermission", () => {
  it("should grant all permissions to super_admin", () => {
    expect(hasPermission(superAdmin as any, "tickets:create")).toBe(true);
    expect(hasPermission(superAdmin as any, "tickets:delete")).toBe(true);
    expect(hasPermission(superAdmin as any, "users:manage")).toBe(true);
    expect(hasPermission(superAdmin as any, "quotes:create")).toBe(true);
  });

  it("should grant manager permissions", () => {
    expect(hasPermission(marketingManager as any, "tickets:create")).toBe(true);
    expect(hasPermission(marketingManager as any, "tickets:assign")).toBe(true);
    expect(hasPermission(marketingManager as any, "users:manage")).toBe(false);
  });

  it("should grant limited permissions to staff", () => {
    expect(hasPermission(salesperson as any, "tickets:create")).toBe(true);
    expect(hasPermission(salesperson as any, "tickets:view_own")).toBe(true);
    expect(hasPermission(salesperson as any, "tickets:assign")).toBe(false);
    expect(hasPermission(salesperson as any, "quotes:create")).toBe(false);
  });
});

describe("canViewTicket", () => {
  const ticket = {
    id: "t1",
    created_by: "3",
    assigned_to: "4",
    department_id: "dept-dom",
  };

  it("should allow super_admin to view any ticket", () => {
    expect(canViewTicket(superAdmin as any, ticket as any)).toBe(true);
  });

  it("should allow creator to view ticket", () => {
    expect(canViewTicket(salesperson as any, ticket as any)).toBe(true);
  });

  it("should allow assignee to view ticket", () => {
    expect(canViewTicket(opsManager as any, ticket as any)).toBe(true);
  });

  it("should allow department manager to view department tickets", () => {
    const deptManager = { ...opsManager, id: "99" };
    expect(canViewTicket(deptManager as any, ticket as any)).toBe(true);
  });

  it("should deny access to unrelated users", () => {
    const otherUser = {
      id: "99",
      roles: { name: "salesperson" },
      department_id: "dept-other",
    };
    expect(canViewTicket(otherUser as any, ticket as any)).toBe(false);
  });
});

describe("canUpdateTicket", () => {
  const ticket = {
    id: "t1",
    created_by: "3",
    department_id: "dept-dom",
    status: "open",
  };

  it("should allow super_admin to update any ticket", () => {
    expect(canUpdateTicket(superAdmin as any, ticket as any)).toBe(true);
  });

  it("should allow creator to update own ticket", () => {
    expect(canUpdateTicket(salesperson as any, ticket as any)).toBe(true);
  });

  it("should allow department manager to update department tickets", () => {
    expect(canUpdateTicket(opsManager as any, ticket as any)).toBe(true);
  });

  it("should deny closed ticket updates for non-admin", () => {
    const closedTicket = { ...ticket, status: "closed" };
    expect(canUpdateTicket(salesperson as any, closedTicket as any)).toBe(false);
  });
});

describe("canDeleteTicket", () => {
  const ticket = {
    id: "t1",
    created_by: "3",
    department_id: "dept-dom",
  };

  it("should allow super_admin to delete any ticket", () => {
    expect(canDeleteTicket(superAdmin as any, ticket as any)).toBe(true);
  });

  it("should allow creator to delete own ticket", () => {
    expect(canDeleteTicket(salesperson as any, ticket as any)).toBe(true);
  });

  it("should deny deletion by non-creators", () => {
    const otherUser = {
      id: "99",
      roles: { name: "salesperson" },
      department_id: "dept-sal",
    };
    expect(canDeleteTicket(otherUser as any, ticket as any)).toBe(false);
  });
});

describe("canAssignTicket", () => {
  it("should allow super_admin to assign tickets", () => {
    expect(canAssignTicket(superAdmin as any)).toBe(true);
  });

  it("should allow managers to assign tickets", () => {
    expect(canAssignTicket(marketingManager as any)).toBe(true);
    expect(canAssignTicket(opsManager as any)).toBe(true);
  });

  it("should deny staff from assigning tickets", () => {
    expect(canAssignTicket(salesperson as any)).toBe(false);
  });
});

describe("canCreateQuote", () => {
  it("should allow super_admin to create quotes", () => {
    expect(canCreateQuote(superAdmin as any)).toBe(true);
  });

  it("should allow ops managers to create quotes", () => {
    expect(canCreateQuote(opsManager as any)).toBe(true);
  });

  it("should deny sales staff from creating quotes", () => {
    expect(canCreateQuote(salesperson as any)).toBe(false);
  });
});

describe("canViewDashboard", () => {
  it("should allow all authenticated users to view dashboard", () => {
    expect(canViewDashboard(superAdmin as any)).toBe(true);
    expect(canViewDashboard(marketingManager as any)).toBe(true);
    expect(canViewDashboard(salesperson as any)).toBe(true);
  });
});

describe("canManageUsers", () => {
  it("should only allow super_admin to manage users", () => {
    expect(canManageUsers(superAdmin as any)).toBe(true);
    expect(canManageUsers(marketingManager as any)).toBe(false);
    expect(canManageUsers(salesperson as any)).toBe(false);
    expect(canManageUsers(opsManager as any)).toBe(false);
  });
});