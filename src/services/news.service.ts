import { NewsPost, NewsComment, ProfileType, UserRole } from "../types";
import { mockNews } from "../data/mockData";

/**
 * Serviço de Notícias
 * Gerencia operações de notícias e comentários
 */

export const newsService = {
  /**
   * Retorna todas as notícias
   */
  getAllNews: (): NewsPost[] => {
    return [...mockNews];
  },

  /**
   * Retorna notícia por ID
   */
  getNewsById: (id: string): NewsPost | null => {
    return mockNews.find((n) => n.id === id) || null;
  },

  /**
   * Retorna notícias por tipo
   */
  getNewsByType: (type: "promotion" | "event" | "announcement"): NewsPost[] => {
    return mockNews.filter((n) => n.type === type);
  },

  /**
   * Retorna notícias de um perfil específico
   */
  getNewsByProfile: (profile: ProfileType): NewsPost[] => {
    return mockNews.filter((n) => n.profiles.includes(profile));
  },

  /**
   * Retorna notícias visíveis para um usuário (baseado no perfil que está usando)
   */
  getNewsForUser: (userProfiles: ProfileType[]): NewsPost[] => {
    if (userProfiles.length === 0) return [];

    return mockNews.filter((n) =>
      n.profiles.some((profile) => userProfiles.includes(profile))
    );
  },

  /**
   * Retorna notícias por autor
   */
  getNewsByAuthor: (authorId: string): NewsPost[] => {
    return mockNews.filter((n) => n.authorId === authorId);
  },

  /**
   * Busca notícias por termo (título ou conteúdo)
   */
  searchNews: (searchTerm: string): NewsPost[] => {
    const term = searchTerm.toLowerCase();
    return mockNews.filter(
      (n) =>
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term)
    );
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
    mockNews.push(newNews);
    return newNews;
  },

  /**
   * Atualiza notícia existente
   */
  updateNews: (id: string, updates: Partial<NewsPost>): NewsPost | null => {
    const newsIndex = mockNews.findIndex((n) => n.id === id);
    if (newsIndex === -1) return null;

    const updatedNews = { ...mockNews[newsIndex], ...updates };
    mockNews[newsIndex] = updatedNews;
    return updatedNews;
  },

  /**
   * Deleta notícia (mock)
   */
  deleteNews: (id: string): boolean => {
    const newsIndex = mockNews.findIndex((n) => n.id === id);
    if (newsIndex === -1) return false;
    mockNews.splice(newsIndex, 1);
    return true;
  },

  /**
   * Adiciona comentário a uma notícia
   */
  addComment: (newsId: string, comment: Omit<NewsComment, "id">): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) return null;

    const newComment: NewsComment = {
      ...comment,
      id: `comment-${Date.now()}`,
    };

    news.comments.push(newComment);
    return news;
  },

  /**
   * Remove comentário de uma notícia
   */
  removeComment: (newsId: string, commentId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) return null;

    news.comments = news.comments.filter((c) => c.id !== commentId);
    return news;
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
    if (!news) return null;

    const commentIndex = news.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) return null;

    news.comments[commentIndex] = {
      ...news.comments[commentIndex],
      ...updates,
    };

    return news;
  },

  /**
   * Adiciona like a uma notícia
   */
  likeNews: (newsId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) return null;

    news.likes += 1;
    news.likedByMe = true;
    return news;
  },

  /**
   * Remove like de uma notícia
   */
  unlikeNews: (newsId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) return null;

    news.likes = Math.max(0, news.likes - 1);
    news.likedByMe = false;
    return news;
  },

  /**
   * Adiciona like a um comentário
   */
  likeComment: (newsId: string, commentId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) return null;

    const comment = news.comments.find((c) => c.id === commentId);
    if (!comment) return null;

    comment.likes += 1;
    comment.likedByMe = true;
    return news;
  },

  /**
   * Remove like de um comentário
   */
  unlikeComment: (newsId: string, commentId: string): NewsPost | null => {
    const news = mockNews.find((n) => n.id === newsId);
    if (!news) return null;

    const comment = news.comments.find((c) => c.id === commentId);
    if (!comment) return null;

    comment.likes = Math.max(0, comment.likes - 1);
    comment.likedByMe = false;
    return news;
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
