import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { newsService } from "@/services/news.service";
import { mockNews } from "@/data/mockData";

describe("newsService", () => {
  let originalNews: typeof mockNews;

  beforeEach(() => {
    originalNews = JSON.parse(JSON.stringify(mockNews));
  });

  afterEach(() => {
    mockNews.length = 0;
    mockNews.push(...originalNews);
  });

  describe("getAllNews", () => {
    it("should return all news", () => {
      const result = newsService.getAllNews();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return validated news posts", () => {
      const result = newsService.getAllNews();
      result.forEach((news) => {
        expect(news.id).toBeDefined();
        expect(news.title).toBeDefined();
        expect(news.type).toMatch(/promotion|event|announcement/);
      });
    });
  });

  describe("getNewsById", () => {
    it("should return news post by valid ID", () => {
      const post = mockNews[0];
      const result = newsService.getNewsById(post.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(post.id);
      expect(result?.title).toBe(post.title);
    });

    it("should return null for invalid ID", () => {
      const result = newsService.getNewsById("invalid-id");
      expect(result).toBeNull();
    });
  });

  describe("getNewsByType", () => {
    it("should return only promotion news", () => {
      const result = newsService.getNewsByType("promotion");
      result.forEach((news) => {
        expect(news.type).toBe("promotion");
      });
    });

    it("should return only event news", () => {
      const result = newsService.getNewsByType("event");
      result.forEach((news) => {
        expect(news.type).toBe("event");
      });
    });

    it("should return only announcement news", () => {
      const result = newsService.getNewsByType("announcement");
      result.forEach((news) => {
        expect(news.type).toBe("announcement");
      });
    });
  });

  describe("searchNews", () => {
    it("should find news by title", () => {
      const post = mockNews[0];
      const searchTerm = post.title.substring(0, 3);

      const result = newsService.searchNews(searchTerm);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((n) => n.id === post.id)).toBe(true);
    });

    it("should find news by content", () => {
      const post = mockNews[0];
      const searchTerm = post.content.substring(0, 5);

      const result = newsService.searchNews(searchTerm);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should be case-insensitive", () => {
      const post = mockNews[0];
      const result1 = newsService.searchNews(post.title.toLowerCase());
      const result2 = newsService.searchNews(post.title.toUpperCase());

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
    });
  });

  describe("likeNews", () => {
    it("should increment likes and set likedByMe to true", () => {
      const post = mockNews[0];
      const initialLikes = post.likes;

      const result = newsService.likeNews(post.id);

      expect(result).toBeDefined();
      expect(result?.likes).toBe(initialLikes + 1);
      expect(result?.likedByMe).toBe(true);
    });
  });

  describe("unlikeNews", () => {
    it("should decrement likes and set likedByMe to false", () => {
      const post = mockNews[0];
      const initialLikes = post.likes;

      // First like
      newsService.likeNews(post.id);

      // Then unlike
      const result = newsService.unlikeNews(post.id);

      expect(result).toBeDefined();
      expect(result?.likes).toBe(initialLikes);
      expect(result?.likedByMe).toBe(false);
    });

    it("should not go below zero", () => {
      const post = mockNews.find((n) => n.likes === 0);
      if (post) {
        const result = newsService.unlikeNews(post.id);
        expect(result?.likes).toBe(0);
      }
    });
  });

  describe("addComment", () => {
    it("should add comment to news post", () => {
      const post = mockNews[0];
      const initialCommentCount = post.comments.length;

      const newComment = {
        authorId: "user-1",
        authorName: "Test Author",
        authorRole: "student" as const,
        content: "Test comment",
        date: new Date(),
        likes: 0,
        likedByMe: false,
      };

      const result = newsService.addComment(post.id, newComment);

      expect(result).toBeDefined();
      expect(result?.comments.length).toBe(initialCommentCount + 1);
    });

    it("should return null for invalid post ID", () => {
      const result = newsService.addComment("invalid-id", {
        authorId: "user-1",
        authorName: "Test",
        authorRole: "student",
        content: "Test",
        date: new Date(),
        likes: 0,
        likedByMe: false,
      });
      expect(result).toBeNull();
    });
  });

  describe("removeComment", () => {
    it("should remove comment from post", () => {
      const post = mockNews.find((n) => n.comments.length > 0);
      if (post) {
        const commentToRemove = post.comments[0];
        const initialCount = post.comments.length;

        const result = newsService.removeComment(post.id, commentToRemove.id);

        expect(result).toBeDefined();
        expect(result?.comments.length).toBe(initialCount - 1);
        expect(result?.comments.some((c) => c.id === commentToRemove.id)).toBe(false);
      }
    });
  });

  describe("likeComment", () => {
    it("should increment comment likes", () => {
      const post = mockNews.find((n) => n.comments.length > 0);
      if (post) {
        const comment = post.comments[0];
        const initialLikes = comment.likes;

        const result = newsService.likeComment(post.id, comment.id);

        expect(result).toBeDefined();
        expect(result?.comments[0].likes).toBe(initialLikes + 1);
      }
    });
  });

  describe("createNews", () => {
    it("should create new news post with generated ID", () => {
      const newPostData = {
        title: "Test News",
        content: "This is a test news post",
        type: "announcement" as const,
        profiles: ["huron-areia"],
        date: new Date(),
        authorId: "user-1",
        authorName: "Test Author",
        authorRole: "admin" as const,
        likes: 0,
        likedByMe: false,
        shares: 0,
      };

      const initialCount = mockNews.length;
      const result = newsService.createNews(newPostData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe(newPostData.title);
      expect(result.comments).toEqual([]);
      expect(mockNews.length).toBe(initialCount + 1);
    });
  });

  describe("updateNews", () => {
    it("should update existing news post", () => {
      const post = mockNews[0];
      const newTitle = "Updated Title";

      const result = newsService.updateNews(post.id, { title: newTitle });

      expect(result).toBeDefined();
      expect(result?.title).toBe(newTitle);
      expect(result?.id).toBe(post.id);
    });
  });

  describe("deleteNews", () => {
    it("should delete news post", () => {
      const initialCount = mockNews.length;
      const postToDelete = mockNews[mockNews.length - 1];

      const result = newsService.deleteNews(postToDelete.id);

      expect(result).toBe(true);
      expect(mockNews.length).toBe(initialCount - 1);
    });

    it("should return false for invalid post ID", () => {
      const result = newsService.deleteNews("invalid-id");
      expect(result).toBe(false);
    });
  });

  describe("getStatistics", () => {
    it("should return statistics with correct structure", () => {
      const result = newsService.getStatistics();

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.promotions).toBeGreaterThanOrEqual(0);
      expect(result.events).toBeGreaterThanOrEqual(0);
      expect(result.announcements).toBeGreaterThanOrEqual(0);
      expect(result.totalComments).toBeGreaterThanOrEqual(0);
      expect(result.totalLikes).toBeGreaterThanOrEqual(0);
      expect(result.avgCommentsPerPost).toBeGreaterThanOrEqual(0);
      expect(result.avgLikesPerPost).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getNewsByProfile", () => {
    it("should return news by profile", () => {
      const result = newsService.getNewsByProfile("huron-areia");
      expect(Array.isArray(result)).toBe(true);
      result.forEach((news) => {
        expect(news.profiles).toContain("huron-areia");
      });
    });
  });

  describe("getNewsForUser", () => {
    it("should return news for user profiles", () => {
      const result = newsService.getNewsForUser(["huron-areia", "huron-personal"]);
      expect(Array.isArray(result)).toBe(true);
      result.forEach((news) => {
        expect(news.profiles.some((p) => ["huron-areia", "huron-personal"].includes(p))).toBe(true);
      });
    });

    it("should return empty for empty user profiles", () => {
      const result = newsService.getNewsForUser([]);
      expect(result).toEqual([]);
    });
  });

  describe("getNewsByAuthor", () => {
    it("should return news by author ID", () => {
      const post = mockNews[0];
      const result = newsService.getNewsByAuthor(post.authorId);
      
      expect(Array.isArray(result)).toBe(true);
      result.forEach((news) => {
        expect(news.authorId).toBe(post.authorId);
      });
    });
  });
});
