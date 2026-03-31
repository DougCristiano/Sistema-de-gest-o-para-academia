import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDataList } from "@/hooks/useDataList";
import { mockUsers } from "@/data/mockData";

describe("useDataList Hook", () => {
  const testData = mockUsers.slice(0, 10);

  describe("initialization", () => {
    it("should initialize with all data", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name", "email"],
        })
      );

      expect(result.current.allData).toEqual(testData);
      expect(result.current.itemsCount).toBe(testData.length);
    });

    it("should initialize with correct pagination", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          pageSize: 5,
        })
      );

      expect(result.current.page).toBe(1);
      expect(result.current.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("search", () => {
    it("should filter data by search term", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
        })
      );

      act(() => {
        result.current.setSearch(testData[0].name.substring(0, 3));
      });

      expect(result.current.searchedCount).toBeGreaterThan(0);
      expect(
        result.current.data.some((item) =>
          (item as any).name.toLowerCase().includes(testData[0].name.substring(0, 3).toLowerCase())
        )
      ).toBe(true);
    });

    it("should return all data when search is cleared", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
        })
      );

      act(() => {
        result.current.setSearch("test");
      });

      expect(result.current.searchedCount).toBeLessThanOrEqual(testData.length);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchTerm).toBe("");
      expect(result.current.searchedCount).toBe(testData.length);
    });

    it("should be case-insensitive", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
        })
      );

      const searchTerm = testData[0].name.substring(0, 3);

      act(() => {
        result.current.setSearch(searchTerm.toLowerCase());
      });

      const lowercaseResults = result.current.searchedCount;

      act(() => {
        result.current.clearSearch();
        result.current.setSearch(searchTerm.toUpperCase());
      });

      const uppercaseResults = result.current.searchedCount;

      expect(lowercaseResults).toBe(uppercaseResults);
    });
  });

  describe("sorting", () => {
    it("should sort data in ascending order by default", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          sortDefaultField: "name",
          sortDefaultDir: "asc",
        })
      );

      expect(result.current.sortDir).toBe("asc");
    });

    it("should toggle sort direction", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          sortDefaultField: "name",
          sortDefaultDir: "asc",
        })
      );

      expect(result.current.sortDir).toBe("asc");

      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortDir).toBe("desc");
    });

    it("should clear sorting", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          sortDefaultField: "name",
          sortDefaultDir: "asc",
        })
      );

      act(() => {
        result.current.clearSort();
      });

      expect(result.current.sortField).toBeNull();
    });
  });

  describe("pagination", () => {
    it("should paginate data correctly", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          pageSize: 3,
        })
      );

      expect(result.current.page).toBe(1);
      expect(result.current.data.length).toBeLessThanOrEqual(3);
      expect(result.current.totalPages).toBeGreaterThan(0);
    });

    it("should handle next page navigation", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          pageSize: 3,
        })
      );

      const initialPage = result.current.page;

      if (result.current.hasNextPage) {
        act(() => {
          result.current.nextPage();
        });

        expect(result.current.page).toBe(initialPage + 1);
      }
    });

    it("should handle next and previous page navigation", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          pageSize: 3,
        })
      );

      expect(result.current.page).toBe(1);

      if (result.current.hasNextPage) {
        act(() => {
          result.current.nextPage();
        });

        expect(result.current.page).toBe(2);
      }

      if (result.current.hasPreviousPage) {
        act(() => {
          result.current.previousPage();
        });

        expect(result.current.page).toBe(1);
      }
    });

    it("should go to specific page", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          pageSize: 2,
        })
      );

      if (result.current.totalPages > 1) {
        act(() => {
          result.current.goToPage(2);
        });

        expect(result.current.page).toBe(2);
      }
    });
  });

  describe("combined operations", () => {
    it("should work with search + sort + pagination", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          sortDefaultField: "name",
          sortDefaultDir: "asc",
          pageSize: 3,
        })
      );

      // Apply search
      act(() => {
        result.current.setSearch("a");
      });

      const searchedCount = result.current.searchedCount;

      // Apply sort
      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortDir).toBe("desc");

      // Apply pagination
      if (result.current.totalPages > 1) {
        act(() => {
          result.current.goToPage(2);
        });

        expect(result.current.page).toBe(2);
      }

      expect(result.current.data.length).toBeGreaterThan(0);
    });

    it("should reset correctly", () => {
      const { result } = renderHook(() =>
        useDataList(testData, {
          searchFields: ["name"],
          sortDefaultField: "name",
          sortDefaultDir: "asc",
          pageSize: 3,
        })
      );

      // Apply filters
      act(() => {
        result.current.setSearch("test");
        result.current.goToPage(2);
      });

      // Clear search
      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchTerm).toBe("");

      // Clear sort
      act(() => {
        result.current.clearSort();
      });

      expect(result.current.sortField).toBeNull();

      // Go back to first page
      act(() => {
        result.current.goToPage(1);
      });

      expect(result.current.page).toBe(1);
    });
  });
});
