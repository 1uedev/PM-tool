import { z } from "zod";
import { ARTIFACT_TYPE, ARTIFACT_STATUS } from "@/lib/constants.js";

const artifactTypes = Object.values(ARTIFACT_TYPE);
const artifactStatuses = Object.values(ARTIFACT_STATUS);

export const createArtifactSchema = z.object({
  type: z.enum(artifactTypes, { required_error: "Typ ist erforderlich" }),
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel zu lang"),
  status: z.enum(artifactStatuses).optional().default("DRAFT"),
  fields: z.record(z.string()).optional().default({}),
});

export const updateArtifactSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel zu lang").optional(),
  status: z.enum(artifactStatuses).optional(),
  fields: z.record(z.string()).optional(),
});
