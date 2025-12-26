import {
  generateTicketCode,
  getTicketTypePrefix,
  getDepartmentCode,
  parseTicketCode,
  getStatusTransitions,
  canTransitionTo,
  getValidTransitions,
  getPriorityWeight,
  sortByPriority,
} from "@/lib/ticket-utils";

describe("generateTicketCode", () => {
  it("should generate RFQ ticket code", () => {
    const code = generateTicketCode("RFQ", "DOM", new Date("2026-02-01"), 1);
    expect(code).toBe("RFQDOM010226001");
  });

  it("should generate GEN ticket code", () => {
    const code = generateTicketCode("GEN", "MKT", new Date("2026-01-15"), 5);
    expect(code).toBe("GENMKT150126005");
  });

  it("should pad sequence number", () => {
    const code = generateTicketCode("RFQ", "SAL", new Date("2026-03-05"), 99);
    expect(code).toBe("RFQSAL050326099");
  });

  it("should handle large sequence numbers", () => {
    const code = generateTicketCode("RFQ", "EXI", new Date("2026-12-25"), 999);
    expect(code).toBe("RFQEXI251226999");
  });
});

describe("getTicketTypePrefix", () => {
  it("should return correct prefix for each type", () => {
    expect(getTicketTypePrefix("RFQ")).toBe("RFQ");
    expect(getTicketTypePrefix("GEN")).toBe("GEN");
  });
});

describe("getDepartmentCode", () => {
  it("should return correct department codes", () => {
    expect(getDepartmentCode("marketing")).toBe("MKT");
    expect(getDepartmentCode("sales")).toBe("SAL");
    expect(getDepartmentCode("domestics")).toBe("DOM");
    expect(getDepartmentCode("exim")).toBe("EXI");
    expect(getDepartmentCode("dtd")).toBe("DTD");
    expect(getDepartmentCode("warehouse")).toBe("TRF");
  });

  it("should handle unknown departments", () => {
    expect(getDepartmentCode("unknown")).toBe("GEN");
  });
});

describe("parseTicketCode", () => {
  it("should parse RFQ ticket code", () => {
    const result = parseTicketCode("RFQDOM010226001");
    expect(result).toEqual({
      type: "RFQ",
      department: "DOM",
      date: "010226",
      sequence: 1,
    });
  });

  it("should parse GEN ticket code", () => {
    const result = parseTicketCode("GENMKT150126005");
    expect(result).toEqual({
      type: "GEN",
      department: "MKT",
      date: "150126",
      sequence: 5,
    });
  });

  it("should return null for invalid codes", () => {
    expect(parseTicketCode("INVALID")).toBeNull();
    expect(parseTicketCode("")).toBeNull();
    expect(parseTicketCode("ABC123")).toBeNull();
  });
});

describe("getStatusTransitions", () => {
  it("should return valid transitions for open status", () => {
    const transitions = getStatusTransitions("open");
    expect(transitions).toContain("in_progress");
    expect(transitions).toContain("closed");
    expect(transitions).not.toContain("open");
  });

  it("should return valid transitions for in_progress status", () => {
    const transitions = getStatusTransitions("in_progress");
    expect(transitions).toContain("pending");
    expect(transitions).toContain("resolved");
    expect(transitions).toContain("open");
  });

  it("should return limited transitions for resolved status", () => {
    const transitions = getStatusTransitions("resolved");
    expect(transitions).toContain("closed");
    expect(transitions).toContain("open");
  });

  it("should return empty for closed status", () => {
    const transitions = getStatusTransitions("closed");
    expect(transitions).toHaveLength(0);
  });
});

describe("canTransitionTo", () => {
  it("should allow valid transitions", () => {
    expect(canTransitionTo("open", "in_progress")).toBe(true);
    expect(canTransitionTo("in_progress", "resolved")).toBe(true);
    expect(canTransitionTo("resolved", "closed")).toBe(true);
  });

  it("should deny invalid transitions", () => {
    expect(canTransitionTo("closed", "open")).toBe(false);
    expect(canTransitionTo("open", "resolved")).toBe(false);
  });
});

describe("getValidTransitions", () => {
  it("should return transition options with labels", () => {
    const transitions = getValidTransitions("open");
    expect(transitions.length).toBeGreaterThan(0);
    expect(transitions[0]).toHaveProperty("value");
    expect(transitions[0]).toHaveProperty("label");
  });
});

describe("getPriorityWeight", () => {
  it("should return correct weights", () => {
    expect(getPriorityWeight("urgent")).toBe(4);
    expect(getPriorityWeight("high")).toBe(3);
    expect(getPriorityWeight("medium")).toBe(2);
    expect(getPriorityWeight("low")).toBe(1);
  });

  it("should default to 0 for unknown priority", () => {
    expect(getPriorityWeight("unknown" as any)).toBe(0);
  });
});

describe("sortByPriority", () => {
  it("should sort tickets by priority descending", () => {
    const tickets = [
      { id: "1", priority: "low" },
      { id: "2", priority: "urgent" },
      { id: "3", priority: "medium" },
      { id: "4", priority: "high" },
    ] as any[];

    const sorted = sortByPriority(tickets);
    expect(sorted[0].priority).toBe("urgent");
    expect(sorted[1].priority).toBe("high");
    expect(sorted[2].priority).toBe("medium");
    expect(sorted[3].priority).toBe("low");
  });

  it("should handle empty array", () => {
    expect(sortByPriority([])).toEqual([]);
  });
});