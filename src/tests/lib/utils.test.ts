import {
  cn,
  debounce,
  formatRelativeTime,
  formatDateTime,
  formatDate,
  formatCurrency,
  formatNumber,
  truncate,
  titleCase,
  generateId,
  isEmpty,
  getInitials,
  formatFileSize,
  parseQueryString,
  buildQueryString,
} from "@/lib/utils";

describe("cn (classnames utility)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should merge Tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});

describe("debounce", () => {
  jest.useFakeTimers();

  it("should delay function execution", () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls", () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("formatRelativeTime", () => {
  it("should return 'just now' for recent times", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("should return minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("should return hours ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("should return days ago", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("2d ago");
  });

  it("should return weeks ago", () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("2w ago");
  });
});

describe("formatDateTime", () => {
  it("should format date and time correctly", () => {
    const date = new Date("2025-01-15T14:30:00");
    const result = formatDateTime(date);
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});

describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2025-06-20");
    const result = formatDate(date);
    expect(result).toContain("Jun");
    expect(result).toContain("20");
    expect(result).toContain("2025");
  });
});

describe("formatCurrency", () => {
  it("should format USD currency", () => {
    expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
  });

  it("should format with default USD", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatNumber", () => {
  it("should add thousand separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("should handle small numbers", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("truncate", () => {
  it("should truncate long text", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("should not truncate short text", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });

  it("should handle exact length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});

describe("titleCase", () => {
  it("should capitalize first letter of each word", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("should handle uppercase input", () => {
    expect(titleCase("HELLO WORLD")).toBe("Hello World");
  });

  it("should handle mixed case", () => {
    expect(titleCase("hElLo WoRlD")).toBe("Hello World");
  });
});

describe("generateId", () => {
  it("should generate id of specified length", () => {
    expect(generateId(8).length).toBe(8);
    expect(generateId(12).length).toBe(12);
  });

  it("should generate unique ids", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe("isEmpty", () => {
  it("should return true for null", () => {
    expect(isEmpty(null)).toBe(true);
  });

  it("should return true for undefined", () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it("should return true for empty string", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty("   ")).toBe(true);
  });

  it("should return true for empty array", () => {
    expect(isEmpty([])).toBe(true);
  });

  it("should return true for empty object", () => {
    expect(isEmpty({})).toBe(true);
  });

  it("should return false for non-empty values", () => {
    expect(isEmpty("hello")).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe("getInitials", () => {
  it("should return initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should handle single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should limit to 2 characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });
});

describe("formatFileSize", () => {
  it("should format bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(2048)).toBe("2 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(5242880)).toBe("5 MB");
  });

  it("should handle zero", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });
});

describe("parseQueryString", () => {
  it("should parse query string", () => {
    expect(parseQueryString("?foo=bar&baz=qux")).toEqual({
      foo: "bar",
      baz: "qux",
    });
  });

  it("should handle empty string", () => {
    expect(parseQueryString("")).toEqual({});
  });
});

describe("buildQueryString", () => {
  it("should build query string from object", () => {
    expect(buildQueryString({ foo: "bar", baz: 123 })).toBe("?foo=bar&baz=123");
  });

  it("should filter out empty values", () => {
    expect(buildQueryString({ foo: "bar", baz: undefined, qux: "" })).toBe("?foo=bar");
  });

  it("should return empty string for empty object", () => {
    expect(buildQueryString({})).toBe("");
  });
});