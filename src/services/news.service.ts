import { NewsPost, NewsComment, ProfileType } from "../types";
import { mockNews } from "../data/mockData";
import { NewsPostSchema } from "../schemas";

/**
 * Serviço de Notícias
 * Gerencia operações de notícias e comentários
 * Todos os dados são validados com Zod antes de retornar
 */

export const newsService = {
  /**
   * Valida dados da notícia com Zod
   * @throws Error se dados são inválidos
   */
  _validateNews: (news: unknown): NewsPost => {
    return NewsPostSchema.parse(news);
  },

  /**
   * Valida e filtra array de notícias
   */
  _validateNewsList: (newsList: unknown[]): NewsPost[] => {
    return newsList.map((n) => newsService._validateNews(n));
  },

  /**
   * Retorna todas as notícias
   */
  getAllNews: (): NewsPost[] => {
    try {
      return newsService._validateNewsList(mockNews);
    } catch (error) {
      console.error("Invalid news data:", error);
      return [];
    }
  },

  /**
   * Retorna notícia por ID
   */
  getNewsById: (id: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === id);
    if (!news) {return null;}
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data:", error);
      return null;
    }
  },

  /**
   * Retorna notícias por tipo
   */
  getNewsByType: (type: "promotion" | "event" | "announcement"): NewsPost[] => {
    try {
      return newsService._validateNewsList(mockNews.filter((n) => n.type === type));
    } catch (error) {
      console.error("Invalid news data:", error);
      return [];
    }
  },

  /**
   * Retorna notícias de um perfil específico
   */
  getNewsByProfile: (profile: ProfileType): NewsPost[] => {
    try {
      return newsService._validateNewsList(mockNews.filter((n) => n.profiles.includes(profile)));
    } catch (error) {
      console.error("Invalid news data:", error);
      return [];
    }
  },

  /**
   * Retorna notícias visíveis para um usuário (baseado no perfil que está usando)
   */
  getNewsForUser: (userProfiles: ProfileType[]): NewsPost[] => {
    if (userProfiles.length === 0) {return [];}

    try {
      const filtered = mockNews.filter((n) =>
        n.profiles.some((profile) => userProfiles.includes(profile))
      );
      return newsService._validateNewsList(filtered);
    } catch (error) {
      console.error("Invalid news data:", error);
      return [];
    }
  },

  /**
   * Retorna notícias por autor
   */
  getNewsByAuthor: (authorId: string): NewsPost[] => {
    try {
      return newsService._validateNewsList(mockNews.filter((n) => n.authorId === authorId));
    } catch (error) {
      console.error("Invalid news data:", error);
      return [];
    }
  },

  /**
   * Busca notícias por termo (título ou conteúdo)
   */
  searchNews: (searchTerm: string): NewsPost[] => {
    try {
      const term = searchTerm.toLowerCase();
      const filtered = mockNews.filter(
        (n) => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)
      );
      return newsService._validateNewsList(filtered);
    } catch (error) {
      console.error("Invalid news data:", error);
      return [];
    }
  },

  /**
   * Cria nova notícia (mock)
   */
  createNews: (newsData: Omit<NewsPost, "id" | "comments">): NewsPost => {
    const newId = `news-${Date.now()}`;
    const newNews: NewsPost = {
      ...newsData,
      id: newId,
      comments: [],
    };
    try {
      const validatedNews = newsService._validateNews(newNews);
      mockNews.push(validatedNews);
      return validatedNews;
    } catch (error) {
      console.error("Invalid news data on creation:", error);
      throw error;
    }
  },

  /**
   * Atualiza notícia existente
   */
  updateNews: (id: string, updates: Partial<NewsPost>): NewsPost | null => {
    const newsIndex = mockNews.findIndex((n) => n.id === id);
    if (newsIndex === -1) {return null;}

    const updatedNews = { ...mockNews[newsIndex], ...updates };
    try {
      const validatedNews = newsService._validateNews(updatedNews);
      mockNews[newsIndex] = validatedNews;
      return validatedNews;
    } catch (error) {
      console.error("Invalid news data on update:", error);
      return null;
    }
  },

  /**
   * Deleta notícia (mock)
   */
  deleteNews: (id: string): boolean => {
    const newsIndex = mockNews.findIndex((n) => n.id === id);
    if (newsIndex === -1) {return false;}
    mockNews.splice(newsIndex, 1);
    return true;
  },

  /**
   * Adiciona comentário a uma notícia
   */
  addComment: (newsId: string, comment: Omit<NewsComment, "id">): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    const newComment: NewsComment = {
      ...comment,
      id: `comment-${Date.now()}`,
    };

    news.comments.push(newComment);
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after adding comment:", error);
      return null;
    }
  },

  /**
   * Remove comentário de uma notícia
   */
  removeComment: (newsId: string, commentId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    news.comments = news.comments.filter((c) => c.id !== commentId);
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after removing comment:", error);
      return null;
    }
  },

  /**
   * Atualiza um comentário
   */
  updateComment: (
    newsId: string,
    commentId: string,
    updates: Partial<NewsComment>
  ): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    const commentIndex = news.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {return null;}

    news.comments[commentIndex] = {
      ...news.comments[commentIndex],
      ...updates,
    };

    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after updating comment:", error);
      return null;
    }
  },

  /**
   * Adiciona like a uma notícia
   */
  likeNews: (newsId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    news.likes += 1;
    news.likedByMe = true;
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after like:", error);
      return null;
    }
  },

  /**
   * Remove like de uma notícia
   */
  unlikeNews: (newsId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    news.likes = Math.max(0, news.likes - 1);
    news.likedByMe = false;
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after unlike:", error);
      return null;
    }
  },

  /**
   * Adiciona like a um comentário
   */
  likeComment: (newsId: string, commentId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    const comment = news.comments.find((c) => c.id === commentId);
    if (!comment) {return null;}

    comment.likes += 1;
    comment.likedByMe = true;
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after comment like:", error);
      return null;
    }
  },

  /**
   * Remove like de um comentário
   */
  unlikeComment: (newsId: string, commentId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) {return null;}

    const comment = news.comments.find((c) => c.id === commentId);
    if (!comment) {return null;}

    comment.likes = Math.max(0, comment.likes - 1);
    comment.likedByMe = false;
    try {
      return newsService._validateNews(news);
    } catch (error) {
      console.error("Invalid news data after comment unlike:", error);
      return null;
    }
  },

  /**
   * Retorna dados agregados de notícias
   */
  getStatistics: () => {
    const total = mockNews.length;
    const promotions = mockNews.filter((n) => n.type === "promotion").length;
    const events = mockNews.filter((n) => n.type === "event").length;
    const announcements = mockNews.filter((n) => n.type === "announcement").length;
    const totalComments = mockNews.reduce((sum, n) => sum + n.comments.length, 0);
    const totalLikes = mockNews.reduce((sum, n) => sum + n.likes, 0);

    return {
      total,
      promotions,
      events,
      announcements,
      totalComments,
      totalLikes,
      avgCommentsPerPost: total > 0 ? Math.round(totalComments / total) : 0,
      avgLikesPerPost: total > 0 ? Math.round(totalLikes / total) : 0,
    };
  },

  /**
   * Retorna notícias ordenadas por data (mais recentes primeiro)
   */
  getNewsOrderedByDate: (): NewsPost[] => {
    return [...mockNews].sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  /**
   * Retorna notícias ordenadas por relevância (mais likes)
   */
  getNewsOrderedByLikes: (): NewsPost[] => {
    return [...mockNews].sort((a, b) => b.likes - a.likes);
  },
};
