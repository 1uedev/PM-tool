import { z } from "zod";

export const SYSTEM_ROLES = ["ADMIN", "USER"];
export const USER_STATUSES = ["ACTIVE", "INACTIVE"];

export const createUserSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  firstName: z.string().min(1, "Vorname ist erforderlich").max(100),
  lastName: z.string().min(1, "Nachname ist erforderlich").max(100),
  systemRole: z.enum(SYSTEM_ROLES).default("USER"),
  status: z.enum(USER_STATUSES).default("ACTIVE"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben").optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  systemRole: z.enum(SYSTEM_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export function formatUserName(user) {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.name) return user.name;
  return user.email;
}

export function safeUser(user) {
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    displayName: formatUserName(user),
  };
}
