import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { NewsCard } from "../components/NewsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Plus,
  Newspaper,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Search,
  ImagePlus,
} from "lucide-react";
import { mockNews } from "../data/mockData";
import { PROFILE_NAMES, ProfileType } from "../types";

export const AdminNews: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "promotion" | "event" | "announcement"
  >("all");
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    type: "announcement" as "promotion" | "event" | "announcement",
    profiles: [] as ProfileType[],
  });

  const toggleProfile = (profile: ProfileType) => {
    setNewNews((prev) => ({
      ...prev,
      profiles: prev.profiles.includes(profile)
        ? prev.profiles.filter((p) => p !== profile)
        : [...prev.profiles, profile],
    }));
  };

  const handleCreateNews = () => {
    console.log("Creating news:", newNews);
    setIsDialogOpen(false);
    setNewNews({
      title: "",
      content: "",
      type: "announcement",
      profiles: [],
    });
  };

  const totalLikes = mockNews.reduce((acc, n) => acc + n.likes, 0);
  const totalComments = mockNews.reduce((acc, n) => acc + n.comments.length, 0);
  const totalShares = mockNews.reduce((acc, n) => acc + n.shares, 0);

  const filteredNews = mockNews
    .filter((n) => filterType === "all" || n.type === filterType)
    .filter(
      (n) =>
        !searchTerm ||
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Feed de Notícias</h1>
          <p className="text-gray-500 text-sm">
            Gerencie publicações da comunidade Huron
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#22c55e]/90">
              <Plus className="w-4 h-4" />
              Nova Publicação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Nova Publicação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newNews.title}
                  onChange={(e) =>
                    setNewNews({ ...newNews, title: e.target.value })
                  }
                  placeholder="Ex: Promoção de Verão"
                />
              </div>
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={newNews.content}
                  onChange={(e) =>
                    setNewNews({ ...newNews, content: e.target.value })
                  }
                  placeholder="Escreva sua publicação aqui..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Imagem (opcional)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#22c55e]/50 transition-colors cursor-pointer">
                  <ImagePlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Clique para adicionar uma imagem
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newNews.type}
                  onValueChange={(
                    value: "promotion" | "event" | "announcement",
                  ) => setNewNews({ ...newNews, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotion">Promoção</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="announcement">Comunicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Serviços</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(
                    [
                      "huron-areia",
                      "huron-personal",
                      "huron-recovery",
                      "htri",
                      "avitta",
                    ] as ProfileType[]
                  ).map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      onClick={() => toggleProfile(profile)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        newNews.profiles.includes(profile)
                          ? "bg-[#22c55e] text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {PROFILE_NAMES[profile]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Selecione os serviços que verão esta publicação
                </p>
              </div>
              <Button
                onClick={handleCreateNews}
                className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90"
              >
                Publicar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-[#22c55e]/10 p-2.5 rounded-xl">
            <Newspaper className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div>
            <p className="text-xl font-bold">{mockNews.length}</p>
            <p className="text-xs text-gray-500">Publicações</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-xl">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalLikes}</p>
            <p className="text-xs text-gray-500">Curtidas</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-[#3b82f6]/10 p-2.5 rounded-xl">
            <MessageCircle className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalComments}</p>
            <p className="text-xs text-gray-500">Comentários</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-purple-50 p-2.5 rounded-xl">
            <Share2 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalShares}</p>
            <p className="text-xs text-gray-500">Compartilhamentos</p>
          </div>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar publicações..."
            className="pl-10 bg-gray-50 rounded-xl"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(
            value: "all" | "promotion" | "event" | "announcement",
          ) => setFilterType(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="promotion">Promoções</SelectItem>
            <SelectItem value="event">Eventos</SelectItem>
            <SelectItem value="announcement">Comunicados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* News Feed */}
      {filteredNews.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1 text-gray-700">
              {searchTerm
                ? "Nenhum resultado encontrado"
                : "Nenhuma publicação"}
            </h3>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Tente buscar com outros termos"
                : "Crie sua primeira publicação"}
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
