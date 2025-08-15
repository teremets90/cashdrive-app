import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Некорректная дата"),
  phone: z
    .string()
    .min(5, "Слишком короткий номер")
    .regex(/^[+\d][\d\s()-]{4,}$/u, "Некорректный телефон"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const LoginSchema = z.object({
  phone: z.string().min(5),
  password: z.string().min(6),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").optional(),
  birthDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Некорректная дата")
    .optional(),
  photoUrl: z.string().refine(
    (url) => {
      // Принимаем как полные URL, так и относительные пути
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      }
      // Для относительных путей проверяем, что это валидный путь
      return url.startsWith('/') && url.length > 1;
    },
    "Некорректный URL или путь к файлу"
  ).optional(),
});

export const ProgressUpdateSchema = z.object({
  challengeId: z.string().min(1),
  addTrips: z.number().int().positive(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type ProgressUpdateInput = z.infer<typeof ProgressUpdateSchema>;



