import Badge from "@/components/ui/Badge.jsx";
import { ARTIFACT_STATUS_LABELS } from "@/lib/constants.js";

const STATUS_VARIANT = {
  DONE: "green",
  IN_REVIEW: "yellow",
  DRAFT: "gray",
};

export default function ArtifactStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "gray"}>
      {ARTIFACT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
