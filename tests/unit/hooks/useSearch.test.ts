import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearch } from "@/hooks/useSearch";

describe("useSearch Hook", () => {
  const testData = [
    { id: "1", name: "John Smith", email: "john@example.com" },
    { id: "2", name: "Jane Doe", email: "jane@example.com" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com" },
    { id: "4", name: "Alice Brown", email: "alice@example.com" },
  ];

  describe("initialization", () => {
    it("should initialize with empty search term", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      expect(result.current.searchTerm).toBe("");
      expect(result.current.results).toEqual(testData);
    });
  });

  describe("search functionality", () => {
    it("should search by single field", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      act(() => {
        result.current.handleSearch("John");
      });

      expect(result.current.searchTerm).toBe("John");
      expect(result.current.results.length).toBe(2);
      expect(result.current.results[0].name).toContain("John");
    });

    it("should search by multiple fields", () => {
      const { result } = renderHook(() => useSearch(testData, ["name", "email"]));

      act(() => {
        result.current.handleSearch("example.com");
      });

      expect(result.current.results.length).toBe(4);
    });

    it("should be case-insensitive", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      act(() => {
        result.current.handleSearch("john");
      });

      const lowercaseResults = result.current.results.length;

      act(() => {
        result.current.clearSearch();
        result.current.handleSearch("JOHN");
      });

      const uppercaseResults = result.current.results.length;

      expect(lowercaseResults).toBe(uppercaseResults);
      expect(lowercaseResults).toBeGreaterThan(0);
    });

    it("should handle empty search term", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      act(() => {
        result.current.handleSearch("John");
      });

      expect(result.current.results.length).toBeLessThan(testData.length);

      act(() => {
        result.current.handleSearch("");
      });

      expect(result.current.searchTerm).toBe("");
      expect(result.current.results).toEqual(testData);
    });

    it("should return empty results for no matches", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      act(() => {
        result.current.handleSearch("NonExistent");
      });

      expect(result.current.results).toEqual([]);
    });
  });

  describe("clear functionality", () => {
    it("should clear search term", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      act(() => {
        result.current.handleSearch("John");
      });

      expect(result.current.searchTerm).toBe("John");

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchTerm).toBe("");
      expect(result.current.results).toEqual(testData);
    });
  });

  describe("partial matches", () => {
    it("should find partial matches", () => {
      const { result } = renderHook(() => useSearch(testData, ["name"]));

      act(() => {
        result.current.handleSearch("Jo");
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results.some((r) => r.name.includes("Jo"))).toBe(true);
    });

    it("should find partial matches in email", () => {
      const { result } = renderHook(() => useSearch(testData, ["email"]));

      act(() => {
        result.current.handleSearch("@example");
      });

      expect(result.current.results.length).toBe(4);
    });
  });
});
