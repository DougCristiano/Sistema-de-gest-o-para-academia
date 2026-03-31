import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/usePagination";

describe("usePagination Hook", () => {
  const testData = Array.from({ length: 25 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
  }));

  describe("initialization", () => {
    it("should initialize with correct pagination state", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.itemsCount).toBe(25);
    });

    it("should calculate total pages correctly", () => {
      const { result } = renderHook(() => usePagination(testData, 5));

      expect(result.current.totalPages).toBe(5);
    });

    it("should handle single page of data", () => {
      const singlePageData = testData.slice(0, 5);
      const { result } = renderHook(() => usePagination(singlePageData, 10));

      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedData).toEqual(singlePageData);
    });
  });

  describe("pagination data", () => {
    it("should return paginated data for first page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      expect(result.current.paginatedData.length).toBe(10);
      expect(result.current.paginatedData[0].id).toBe("item-1");
      expect(result.current.paginatedData[9].id).toBe("item-10");
    });

    it("should return paginated data for middle page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.paginatedData.length).toBe(10);
      expect(result.current.paginatedData[0].id).toBe("item-11");
      expect(result.current.paginatedData[9].id).toBe("item-20");
    });

    it("should return paginated data for last page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.paginatedData.length).toBe(5);
      expect(result.current.paginatedData[0].id).toBe("item-21");
      expect(result.current.paginatedData[4].id).toBe("item-25");
    });
  });

  describe("navigation", () => {
    it("should navigate to next page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
    });

    it("should navigate to previous page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should not go below first page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should not go beyond last page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);

      // Try to go to next page (should stay at 3)
      act(() => {
        result.current.nextPage();
      });

      // Should still be at page 3
      expect(result.current.currentPage).toBe(3);
    });

    it("should go to specific page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
    });
  });

  describe("flags", () => {
    it("should indicate if has next page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      expect(result.current.hasNextPage).toBe(true);

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.hasNextPage).toBe(false);
    });

    it("should indicate if has previous page", () => {
      const { result } = renderHook(() => usePagination(testData, 10));

      expect(result.current.hasPreviousPage).toBe(false);

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.hasPreviousPage).toBe(true);
    });
  });

  describe("data updates", () => {
    it("should update when data changes", () => {
      const { result, rerender } = renderHook(
        ({ data }) => usePagination(data, 10),
        { initialProps: { data: testData } }
      );

      expect(result.current.itemsCount).toBe(25);

      const newData = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i + 1}`,
        name: `Item ${i + 1}`,
      }));

      rerender({ data: newData });

      expect(result.current.itemsCount).toBe(50);
      expect(result.current.totalPages).toBe(5);
    });
  });
});
