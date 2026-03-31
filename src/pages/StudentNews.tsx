import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/card";
import { NewsCard } from "../components/NewsCard";
import { Input } from "../components/ui/input";
import { Newspaper, Calendar, Search, Users, TrendingUp } from "lucide-react";
import { mockNews } from "../data/mockData";

export const StudentNews: React.FC = () => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<"all" | "promotion" | "event" | "announcement">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar notícias relevantes para os serviços do aluno
  const userProfiles = currentUser?.profiles || [];
  const relevantNews = mockNews.filter((news) =>
    news.profiles.some((profile) => userProfiles.includes(profile))
  );

  const filteredNews = relevantNews
    .filter((news) => filter === "all" || news.type === filter)
    .filter(
      (news) =>
        !searchTerm ||
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const promoCount = relevantNews.filter((n) => n.type === "promotion").length;
  const eventCount = relevantNews.filter((n) => n.type === "event").length;
  const announcementCount = relevantNews.filter((n) => n.type === "announcement").length;

  const filterTabs = [
    {
      key: "all" as const,
      label: "Todos",
      count: relevantNews.length,
      icon: Newspaper,
      color: "blue",
    },
    {
      key: "promotion" as const,
      label: "Promoções",
      count: promoCount,
      icon: Gift,
      color: "green",
    },
    {
      key: "event" as const,
      label: "Eventos",
      count: eventCount,
      icon: Calendar,
      color: "purple",
    },
    {
      key: "announcement" as const,
      label: "Comunicados",
      count: announcementCount,
      icon: Bell,
      color: "orange",
    },
  ];

  const totalLikes = relevantNews.reduce((acc, n) => acc + n.likes, 0);
  const totalComments = relevantNews.reduce((acc, n) => acc + n.comments.length, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Feed da Comunidade</h1>
        <p className="text-gray-500 text-sm">Fique por dentro das novidades da Huron</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 flex items-center gap-3">
          <div className="bg-[#22c55e]/10 p-2 rounded-lg">
            <Newspaper className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div>
            <p className="text-lg font-bold">{relevantNews.length}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg">
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{totalLikes}</p>
            <p className="text-xs text-gray-500">Curtidas</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <div className="bg-[#3b82f6]/10 p-2 rounded-lg">
            <Users className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-lg font-bold">{totalComments}</p>
            <p className="text-xs text-gray-500">Comentários</p>
          </div>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar no feed..."
          className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-[#22c55e]/30"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          const colorMap: Record<string, string> = {
            blue: isActive
              ? "bg-[#3b82f6] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            green: isActive
              ? "bg-[#22c55e] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            purple: isActive
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            orange: isActive
              ? "bg-[#eab308] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          };
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${colorMap[tab.color]}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-gray-200"}`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* News Feed */}
      {filteredNews.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1 text-gray-700">Nenhum post encontrado</h3>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Tente buscar com outros termos"
                : "Não há publicações deste tipo no momento"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNews
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
        </div>
      )}
    </div>
  );
};
