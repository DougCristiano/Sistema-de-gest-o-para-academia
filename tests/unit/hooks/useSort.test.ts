import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSort } from "@/hooks/useSort";

describe("useSort Hook", () => {
  const testData = [
    { id: 3, name: "Charlie", score: 85, date: new Date(2025, 0, 15) },
    { id: 1, name: "Alice", score: 92, date: new Date(2025, 0, 10) },
    { id: 2, name: "Bob", score: 78, date: new Date(2025, 0, 20) },
    { id: 4, name: "Diana", score: 88, date: new Date(2025, 0, 5) },
  ];

  describe("initialization", () => {
    it("should initialize with default sort", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "asc")
      );

      expect(result.current.sortField).toBe("name");
      expect(result.current.sortDir).toBe("asc");
    });

    it("should initialize with no sort if not specified", () => {
      const { result } = renderHook(() => useSort(testData));

      expect(result.current.sortField).toBeNull();
      expect(result.current.sortDir).toBe("asc");
      expect(result.current.sorted).toEqual(testData);
    });
  });

  describe("string sorting", () => {
    it("should sort strings ascending", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "asc")
      );

      const names = result.current.sorted.map((item) => item.name);
      expect(names).toEqual(["Alice", "Bob", "Charlie", "Diana"]);
    });

    it("should sort strings descending", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "desc")
      );

      const names = result.current.sorted.map((item) => item.name);
      expect(names).toEqual(["Diana", "Charlie", "Bob", "Alice"]);
    });

    it("should handle case-insensitive sorting", () => {
      const mixedCaseData = [
        { name: "alice" },
        { name: "Bob" },
        { name: "CHARLIE" },
      ];

      const { result } = renderHook(() =>
        useSort(mixedCaseData, "name", "asc")
      );

      const names = result.current.sorted.map((item) => item.name);
      expect(names[0]).toBe("alice");
    });
  });

  describe("numeric sorting", () => {
    it("should sort numbers ascending", () => {
      const { result } = renderHook(() =>
        useSort(testData, "score", "asc")
      );

      const scores = result.current.sorted.map((item) => item.score);
      expect(scores).toEqual([78, 85, 88, 92]);
    });

    it("should sort numbers descending", () => {
      const { result } = renderHook(() =>
        useSort(testData, "score", "desc")
      );

      const scores = result.current.sorted.map((item) => item.score);
      expect(scores).toEqual([92, 88, 85, 78]);
    });
  });

  describe("date sorting", () => {
    it("should sort dates ascending", () => {
      const { result } = renderHook(() =>
        useSort(testData, "date", "asc")
      );

      const dates = result.current.sorted.map((item) => item.date.getDate());
      expect(dates).toEqual([5, 10, 15, 20]);
    });

    it("should sort dates descending", () => {
      const { result } = renderHook(() =>
        useSort(testData, "date", "desc")
      );

      const dates = result.current.sorted.map((item) => item.date.getDate());
      expect(dates).toEqual([20, 15, 10, 5]);
    });
  });

  describe("toggle sort", () => {
    it("should toggle sort direction", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "asc")
      );

      expect(result.current.sortDir).toBe("asc");
      const ascResults = result.current.sorted.map((item) => item.name);

      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortDir).toBe("desc");
      const descResults = result.current.sorted.map((item) => item.name);

      expect(ascResults).not.toEqual(descResults);
      expect(descResults).toEqual([...ascResults].reverse());
    });

    it("should change sort field when toggling different field", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "asc")
      );

      expect(result.current.sortField).toBe("name");

      act(() => {
        result.current.toggleSort("score");
      });

      expect(result.current.sortField).toBe("score");
    });
  });

  describe("clear sort", () => {
    it("should clear sort field", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "asc")
      );

      expect(result.current.sortField).toBe("name");

      act(() => {
        result.current.clearSort();
      });

      expect(result.current.sortField).toBeNull();
      expect(result.current.sorted).toEqual(testData);
    });
  });

  describe("unsorted data", () => {
    it("should return original order when no sort is applied", () => {
      const { result } = renderHook(() => useSort(testData));

      expect(result.current.sorted).toEqual(testData);
    });

    it("should return original order after clearing sort", () => {
      const { result } = renderHook(() =>
        useSort(testData, "name", "asc")
      );

      act(() => {
        result.current.clearSort();
      });

      expect(result.current.sorted).toEqual(testData);
    });
  });
});
