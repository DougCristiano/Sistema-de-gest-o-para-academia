import { z } from "zod";

const ProfileTypeEnum = z.enum([
  "huron-areia",
  "huron-personal",
  "huron-recovery",
  "htri",
  "avitta",
]);

const UserRoleEnum = z.enum(["admin", "manager", "teacher", "student"]);

/**
 * Schema para NewsComment (comentário em notícia)
 */
export const NewsCommentSchema = z.object({
  id: z.string().min(1, "ID inválido"),
  authorId: z.string().min(1, "ID do autor inválido"),
  authorName: z.string().min(3, "Nome do autor inválido"),
  authorAvatar: z.string().url().optional(),
  authorRole: UserRoleEnum,
  content: z
    .string()
    .min(1, "Comentário não pode ser vazio")
    .max(500, "Comentário não pode ter mais de 500 caracteres"),
  date: z.coerce.date(),
  likes: z.number().min(0),
  likedByMe: z.boolean(),
});

export type NewsComment = z.infer<typeof NewsCommentSchema>;

/**
 * Schema para criação de comentário
 */
export const CreateNewsCommentSchema = NewsCommentSchema.omit({
  id: true,
  date: true,
  likes: true,
  likedByMe: true,
});

export type CreateNewsCommentData = z.infer<typeof CreateNewsCommentSchema>;

/**
 * Schema para NewsPost (post de notícia)
 */
export const NewsPostSchema = z.object({
  id: z.string().min(1, "ID inválido"),
  title: z
    .string()
    .min(5, "Título deve ter no mínimo 5 caracteres")
    .max(200, "Título não pode ter mais de 200 caracteres"),
  content: z
    .string()
    .min(10, "Conteúdo deve ter no mínimo 10 caracteres")
    .max(5000, "Conteúdo não pode ter mais de 5000 caracteres"),
  type: z.enum(["promotion", "event", "announcement"]),
  profiles: z.array(ProfileTypeEnum).min(1, "Selecione pelo menos um perfil"),
  date: z.coerce.date(),
  image: z.string().url().optional(),
  authorId: z.string().min(1, "ID do autor inválido"),
  authorName: z.string().min(3, "Nome do autor inválido"),
  authorAvatar: z.string().url().optional(),
  authorRole: UserRoleEnum,
  likes: z.number().min(0),
  likedByMe: z.boolean(),
  comments: z.array(NewsCommentSchema),
  shares: z.number().min(0),
});

export type NewsPost = z.infer<typeof NewsPostSchema>;

/**
 * Schema para criação de post
 */
export const CreateNewsPostSchema = NewsPostSchema.omit({
  id: true,
  date: true,
  likes: true,
  likedByMe: true,
  comments: true,
  shares: true,
});

export type CreateNewsPostData = z.infer<typeof CreateNewsPostSchema>;

/**
 * Schema para atualização de post
 */
export const UpdateNewsPostSchema = CreateNewsPostSchema.partial();

export type UpdateNewsPostData = z.infer<typeof UpdateNewsPostSchema>;

/**
 * Schema para filtro de notícias
 */
export const NewsFilterSchema = z.object({
  profile: ProfileTypeEnum.optional(),
  type: z.enum(["promotion", "event", "announcement"]).optional(),
  searchTerm: z.string().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type NewsFilter = z.infer<typeof NewsFilterSchema>;
