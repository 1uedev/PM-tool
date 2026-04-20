import { z } from "zod";
import { RELATION_TYPE } from "@/lib/constants.js";

const relationTypes = Object.values(RELATION_TYPE);

export const createRelationSchema = z.object({
  targetId: z.string().min(1, "Ziel-Artefakt ist erforderlich"),
  type: z.enum(relationTypes, { required_error: "Relationstyp ist erforderlich" }),
});
