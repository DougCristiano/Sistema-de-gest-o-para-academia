import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MobileLayout } from "../layouts/MobileLayout";
import { MobileCard } from "../components/MobileCard";
import { MobileButton } from "../components/MobileButton";
import { mobileTheme } from "../theme";
import { Heart, MessageCircle, Share2, Newspaper } from "lucide-react";
import { mockNews } from "../../data/mockData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  date: Date;
  image?: string;
  likes: number;
  profiles: string[];
  type: "promotion" | "event" | "announcement" | "news";
}

export const MobileNews: React.FC = () => {
  const { currentUser } = useAuth();
  const [likedNews, setLikedNews] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [filter, setFilter] = useState<"all" | "promotion" | "event" | "announcement">("all");

  // Filter news by user profile
  const userProfiles = currentUser?.profiles || [];
  const filteredNews = (mockNews as NewsItem[])
    .filter((news) => news.profiles.some((profile) => userProfiles.includes(profile)))
    .filter((news) => filter === "all" || news.type === filter);

  const handleLike = (newsId: string) => {
    setLikedNews((prev) =>
      prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId]
    );
  };

  const getNewsBadgeColor = (type: string) => {
    const colors = {
      promotion: { bg: mobileTheme.colors.accent + "20", color: mobileTheme.colors.accent },
      event: { bg: mobileTheme.colors.primary + "20", color: mobileTheme.colors.primary },
      announcement: { bg: mobileTheme.colors.warning + "20", color: mobileTheme.colors.warning },
      news: { bg: mobileTheme.colors.success + "20", color: mobileTheme.colors.success },
    };
    return colors[type as keyof typeof colors] || colors.news;
  };

  return (
    <MobileLayout title="Notícias" showLogout>
      {/* Filter */}
      <div
        style={{
          display: "flex",
          gap: mobileTheme.spacing.sm,
          marginBottom: mobileTheme.spacing.lg,
          overflowX: "auto",
          paddingBottom: mobileTheme.spacing.sm,
        }}
      >
        {["all", "promotion", "event", "announcement"].map((option) => (
          <MobileButton
            key={option}
            variant={filter === option ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(option as any)}
            style={{ whiteSpace: "nowrap" }}
          >
            {option === "all"
              ? "Todas"
              : option === "promotion"
              ? "Promoções"
              : option === "event"
              ? "Eventos"
              : "Avisos"}
          </MobileButton>
        ))}
      </div>

      {/* News List */}
      {filteredNews.length > 0 ? (
        <div>
          {filteredNews.map((news) => {
            const isLiked = likedNews.includes(news.id);
            const badgeColor = getNewsBadgeColor(news.type);

            return (
              <MobileCard
                key={news.id}
                interactive
                onClick={() => setSelectedNews(news)}
                style={{
                  cursor: "pointer",
                }}
              >
                {news.image && (
                  <div
                    style={{
                      width: "100%",
                      height: "120px",
                      borderRadius: mobileTheme.borderRadius.md,
                      background: `linear-gradient(135deg, ${mobileTheme.colors.primary}, ${mobileTheme.colors.secondary})`,
                      marginBottom: mobileTheme.spacing.md,
                    }}
                  />
                )}

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: mobileTheme.spacing.sm }}>
                  <div
                    style={{
                      padding: `${mobileTheme.spacing.xs} ${mobileTheme.spacing.md}`,
                      background: badgeColor.bg,
                      color: badgeColor.color,
                      borderRadius: mobileTheme.borderRadius.full,
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {news.type === "promotion"
                      ? "Promoção"
                      : news.type === "event"
                      ? "Evento"
                      : news.type === "announcement"
                      ? "Aviso"
                      : "Notícia"}
                  </div>
                  <span
                    style={{
                      ...mobileTheme.typography.caption,
                      color: mobileTheme.colors.textSecondary,
                    }}
                  >
                    {formatDistanceToNow(news.date, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <h3
                  style={{
                    ...mobileTheme.typography.h4,
                    margin: 0,
                    marginBottom: "8px",
                    color: mobileTheme.colors.textPrimary,
                  }}
                >
                  {news.title}
                </h3>

                <p
                  style={{
                    ...mobileTheme.typography.bodySmall,
                    margin: 0,
                    marginBottom: mobileTheme.spacing.md,
                    color: mobileTheme.colors.textSecondary,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {news.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: mobileTheme.spacing.md,
                    marginBottom: mobileTheme.spacing.md,
                    paddingBottom: mobileTheme.spacing.md,
                    borderBottom: `1px solid ${mobileTheme.colors.border}`,
                  }}
                >
                  <p
                    style={{
                      ...mobileTheme.typography.caption,
                      margin: 0,
                      color: mobileTheme.colors.textSecondary,
                    }}
                  >
                    Por {news.author}
                  </p>
                  <p
                    style={{
                      ...mobileTheme.typography.caption,
                      margin: 0,
                      color: mobileTheme.colors.textSecondary,
                      textAlign: "right",
                    }}
                  >
                    {news.likes + (isLiked ? 1 : 0)} curtidas
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: mobileTheme.spacing.md,
                    justifyContent: "space-around",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(news.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: isLiked
                        ? mobileTheme.colors.accent
                        : mobileTheme.colors.textSecondary,
                      transition: "color 0.2s",
                      flex: 1,
                      justifyContent: "center",
                      padding: "8px 0",
                    }}
                  >
                    <Heart
                      size={18}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span style={{ fontSize: "12px" }}>Curtir</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: mobileTheme.colors.textSecondary,
                      flex: 1,
                      justifyContent: "center",
                      padding: "8px 0",
                    }}
                  >
                    <MessageCircle size={18} />
                    <span style={{ fontSize: "12px" }}>Comentar</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: mobileTheme.colors.textSecondary,
                      flex: 1,
                      justifyContent: "center",
                      padding: "8px 0",
                    }}
                  >
                    <Share2 size={18} />
                    <span style={{ fontSize: "12px" }}>Compartilhar</span>
                  </button>
                </div>
              </MobileCard>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: mobileTheme.spacing.xl,
            color: mobileTheme.colors.textSecondary,
          }}
        >
          <Newspaper size={48} style={{ opacity: 0.5, marginBottom: mobileTheme.spacing.lg }} />
          <p style={{ ...mobileTheme.typography.body }}>Nenhuma notícia disponível</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNews && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 100,
          }}
          onClick={() => setSelectedNews(null)}
        >
          <div
            style={{
              background: mobileTheme.colors.surface,
              borderTopLeftRadius: mobileTheme.borderRadius.xl,
              borderTopRightRadius: mobileTheme.borderRadius.xl,
              padding: mobileTheme.spacing.xl,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: mobileTheme.spacing.lg }}>
              <h2
                style={{
                  ...mobileTheme.typography.h2,
                  margin: 0,
                  color: mobileTheme.colors.textPrimary,
                }}
              >
                {selectedNews.title}
              </h2>
              <button
                onClick={() => setSelectedNews(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: mobileTheme.colors.textSecondary,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: mobileTheme.spacing.lg }}>
              <p
                style={{
                  ...mobileTheme.typography.bodySmall,
                  color: mobileTheme.colors.textSecondary,
                  margin: 0,
                  marginBottom: "4px",
                }}
              >
                Por {selectedNews.author}
              </p>
              <p
                style={{
                  ...mobileTheme.typography.caption,
                  color: mobileTheme.colors.textSecondary,
                  margin: 0,
                }}
              >
                {formatDistanceToNow(selectedNews.date, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>

            <div
              style={{
                ...mobileTheme.typography.body,
                color: mobileTheme.colors.textPrimary,
                lineHeight: 1.6,
                marginBottom: mobileTheme.spacing.xl,
              }}
            >
              {selectedNews.content}
            </div>

            <div style={{ display: "flex", gap: mobileTheme.spacing.md }}>
              <MobileButton
                variant={likedNews.includes(selectedNews.id) ? "primary" : "outline"}
                fullWidth
                onClick={() => handleLike(selectedNews.id)}
              >
                <Heart size={16} />
                {likedNews.includes(selectedNews.id) ? "Curtido" : "Curtir"}
              </MobileButton>
              <MobileButton variant="outline" fullWidth>
                <Share2 size={16} />
                Compartilhar
              </MobileButton>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};
