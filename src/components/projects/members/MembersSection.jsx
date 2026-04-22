"use client";

import { useSWRConfig } from "swr";
import MemberList from "./MemberList.jsx";
import InviteMember from "./InviteMember.jsx";

export default function MembersSection({ projectId, isOwner }) {
  const { mutate } = useSWRConfig();

  function handleInvited() {
    // Revalidate the member list after a new member is added
    mutate(`/api/projects/${projectId}/members`);
  }

  return (
    <div className="flex flex-col gap-4">
      <MemberList projectId={projectId} />
      {isOwner && (
        <InviteMember projectId={projectId} onInvited={handleInvited} />
      )}
    </div>
  );
}
