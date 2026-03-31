import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilter } from "@/hooks/useFilter";

describe("useFilter Hook", () => {
  const testData = [
    { id: "1", name: "John", role: "admin", status: "active" },
    { id: "2", name: "Jane", role: "user", status: "inactive" },
    { id: "3", name: "Bob", role: "user", status: "active" },
    { id: "4", name: "Alice", role: "admin", status: "pending" },
  ];

  describe("initialization", () => {
    it("should initialize with no filters", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      expect(result.current.filtered).toEqual(testData);
      expect(result.current.filters).toEqual({});
    });

    it("should initialize with initial filters", () => {
      const { result } = renderHook(() =>
        useFilter(testData, { role: "admin" })
      );

      expect(result.current.filters).toEqual({ role: "admin" });
      expect(result.current.filtered.length).toBe(2);
    });
  });

  describe("adding filters", () => {
    it("should add a single filter", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      act(() => {
        result.current.addFilter("role", "admin");
      });

      expect(result.current.filters.role).toBe("admin");
      expect(result.current.filtered.length).toBe(2);
    });

    it("should add multiple filters", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      act(() => {
        result.current.addFilter("role", "admin");
        result.current.addFilter("status", "active");
      });

      expect(result.current.filters.role).toBe("admin");
      expect(result.current.filters.status).toBe("active");
      expect(result.current.filtered.length).toBe(1);
    });

    it("should filter by exact match", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      act(() => {
        result.current.addFilter("id", "1");
      });

      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].name).toBe("John");
    });
  });

  describe("removing filters", () => {
    it("should remove a single filter", () => {
      const { result } = renderHook(() =>
        useFilter(testData, { role: "admin", status: "active" })
      );

      expect(result.current.filtered.length).toBe(1);

      act(() => {
        result.current.removeFilter("status");
      });

      expect(result.current.filters.status).toBeUndefined();
      expect(result.current.filtered.length).toBe(2);
    });

    it("should remove all filters one by one", () => {
      const { result } = renderHook(() =>
        useFilter(testData, { role: "admin", status: "active" })
      );

      act(() => {
        result.current.removeFilter("role");
      });

      expect(result.current.filters.role).toBeUndefined();

      act(() => {
        result.current.removeFilter("status");
      });

      expect(result.current.filters.status).toBeUndefined();
      expect(result.current.filtered).toEqual(testData);
    });
  });

  describe("clearing filters", () => {
    it("should clear all filters", () => {
      const { result } = renderHook(() =>
        useFilter(testData, { role: "admin", status: "active" })
      );

      expect(result.current.filtered.length).toBeLessThan(testData.length);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
      expect(result.current.filtered).toEqual(testData);
    });
  });

  describe("setting filters", () => {
    it("should set multiple filters at once", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      act(() => {
        result.current.setFilters({ role: "admin", status: "active" });
      });

      expect(result.current.filters).toEqual({ role: "admin", status: "active" });
      expect(result.current.filtered.length).toBe(1);
    });

    it("should replace existing filters with new ones", () => {
      const { result } = renderHook(() =>
        useFilter(testData, { role: "admin" })
      );

      expect(result.current.filtered.length).toBe(2);

      act(() => {
        result.current.setFilters({ role: "user" });
      });

      expect(result.current.filters).toEqual({ role: "user" });
      expect(result.current.filtered.length).toBe(2);
    });

    it("should clear filters when setFilters is called with empty object", () => {
      const { result } = renderHook(() =>
        useFilter(testData, { role: "admin" })
      );

      act(() => {
        result.current.setFilters({});
      });

      expect(result.current.filters).toEqual({});
      expect(result.current.filtered).toEqual(testData);
    });
  });

  describe("filter combinations", () => {
    it("should handle AND logic for multiple filters", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      act(() => {
        result.current.addFilter("role", "admin");
      });

      expect(result.current.filtered.length).toBe(2);

      act(() => {
        result.current.addFilter("status", "active");
      });

      // Should only return admins WITH active status
      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].name).toBe("John");
    });

    it("should handle complex filter scenarios", () => {
      const { result } = renderHook(() => useFilter(testData, {}));

      // Add first filter
      act(() => {
        result.current.addFilter("role", "user");
      });

      expect(result.current.filtered.length).toBe(2);

      // Add second filter
      act(() => {
        result.current.addFilter("status", "inactive");
      });

      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].name).toBe("Jane");

      // Remove first filter
      act(() => {
        result.current.removeFilter("role");
      });

      expect(result.current.filtered.length).toBe(1);

      // Remove second filter
      act(() => {
        result.current.removeFilter("status");
      });

      expect(result.current.filtered).toEqual(testData);
    });
  });
});
