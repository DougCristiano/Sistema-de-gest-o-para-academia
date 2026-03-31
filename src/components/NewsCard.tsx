import React, { useState } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Gift,
  Calendar,
  Bell,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Shield,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { NewsPost , PROFILE_NAMES, UserRole } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsCardProps {
  news: NewsPost;
}

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "admin":
      return { label: "Admin", color: "bg-red-100 text-red-700", icon: Shield };
    case "manager":
      return {
        label: "Gerente",
        color: "bg-blue-100 text-blue-700",
        icon: BookOpen,
      };
    case "teacher":
      return {
        label: "Professor",
        color: "bg-green-100 text-green-700",
        icon: GraduationCap,
      };
    default:
      return null;
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-[#22c55e]",
    "bg-[#3b82f6]",
    "bg-[#eab308]",
    "bg-[#a16207]",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const CommentItem: React.FC<{ comment: NewsComment }> = ({ comment }) => {
  const [liked, setLiked] = useState(comment.likedByMe);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const roleBadge = getRoleBadge(comment.authorRole);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex gap-3 group">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={`${getAvatarColor(comment.authorName)} text-white text-xs`}>
          {getInitials(comment.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{comment.authorName}</span>
            {roleBadge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-2">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(comment.date, {
              locale: ptBR,
              addSuffix: true,
            })}
          </span>
          <button
            onClick={toggleLike}
            className={`text-xs font-semibold transition-colors ${
              liked ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Curtir {likeCount > 0 && `(${likeCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const [liked, setLiked] = useState(news.likedByMe);
  const [likeCount, setLikeCount] = useState(news.likes);
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<NewsComment[]>(news.comments);
  const [shareCount, setShareCount] = useState(news.shares);

  const roleBadge = getRoleBadge(news.authorRole);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = () => {
    setShareCount((prev) => prev + 1);
  };

  const handleComment = () => {
    if (!newComment.trim()) {return;}
    const comment: NewsComment = {
      id: `comment-new-${Date.now()}`,
      authorId: "current-user",
      authorName: "Você",
      authorRole: "student",
      content: newComment.trim(),
      date: new Date(),
      likes: 0,
      likedByMe: false,
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setShowAllComments(true);
  };

  const getTypeIcon = () => {
    switch (news.type) {
      case "promotion":
        return <Gift className="w-3.5 h-3.5" />;
      case "event":
        return <Calendar className="w-3.5 h-3.5" />;
      case "announcement":
        return <Bell className="w-3.5 h-3.5" />;
      default:
        return <Megaphone className="w-3.5 h-3.5" />;
    }
  };

  const getTypeStyle = () => {
    switch (news.type) {
      case "promotion":
        return "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20";
      case "event":
        return "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20";
      case "announcement":
        return "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeName = () => {
    switch (news.type) {
      case "promotion":
        return "Promoção";
      case "event":
        return "Evento";
      case "announcement":
        return "Comunicado";
      default:
        return "Notícia";
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(-2);
  const hiddenCount = comments.length - 2;

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header - Author info */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarFallback className={`${getAvatarColor(news.authorName)} text-white text-sm`}>
                {getInitials(news.authorName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{news.authorName}</span>
                {roleBadge && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${roleBadge.color}`}
                  >
                    <roleBadge.icon className="w-2.5 h-2.5" />
                    {roleBadge.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(news.date, {
                    locale: ptBR,
                    addSuffix: true,
                  })}
                </span>
                <span className="text-gray-300">·</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${getTypeStyle()}`}
                >
                  {getTypeIcon()}
                  {getTypeName()}
                </span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <h3 className="font-semibold text-base mb-1.5">{news.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{news.content}</p>

        {/* Profile tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {news.profiles.map((profile) => (
            <span
              key={profile}
              className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
            >
              {PROFILE_NAMES[profile]}
            </span>
          ))}
        </div>
      </div>

      {/* Image */}
      {news.image && (
        <div className="w-full">
          <img src={news.image} alt={news.title} className="w-full h-64 sm:h-80 object-cover" />
        </div>
      )}

      {/* Engagement stats */}
      <div className="px-5 py-2.5 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500">
            <Heart className="w-3 h-3 text-white fill-white" />
          </span>
          <span>
            {likeCount} {likeCount === 1 ? "curtida" : "curtidas"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {comments.length} {comments.length === 1 ? "comentário" : "comentários"}
          </button>
          <span>
            {shareCount} compartilhamento{shareCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-2 py-1 flex items-center border-b border-gray-100">
        <button
          onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            liked
              ? "text-red-500 hover:bg-red-50"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-transform ${liked ? "fill-red-500 scale-110" : ""}`}
          />
          Curtir
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Comentar
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-5 py-4 space-y-4 bg-white">
          {/* Show more comments */}
          {hiddenCount > 0 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              Ver{" "}
              {hiddenCount > 1 ? `todos os ${comments.length} comentários` : "mais 1 comentário"}
            </button>
          )}

          {showAllComments && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllComments(false)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              Ocultar comentários
            </button>
          )}

          {/* Comments list */}
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          {/* New comment input */}
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-[#22c55e] text-white text-xs">VC</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-1 border border-gray-200 focus-within:border-[#22c55e] focus-within:ring-1 focus-within:ring-[#22c55e]/20 transition-all">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Escreva um comentário..."
                className="border-0 shadow-none bg-transparent focus-visible:ring-0 text-sm px-0 h-9"
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className={`p-1.5 rounded-full transition-all ${
                  newComment.trim()
                    ? "text-[#22c55e] hover:bg-[#22c55e]/10 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
