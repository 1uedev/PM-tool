import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Kommentar darf nicht leer sein").max(2000, "Kommentar zu lang"),
});
