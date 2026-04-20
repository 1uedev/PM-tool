import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Name zu lang"),
  description: z.string().max(500, "Beschreibung zu lang").optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Name zu lang").optional(),
  description: z.string().max(500, "Beschreibung zu lang").optional(),
});
