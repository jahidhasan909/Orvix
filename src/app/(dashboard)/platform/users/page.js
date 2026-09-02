"use client";

import PlaceholderPage from "@/Components/Shared/PlaceholderPage";
import InternalCreateNotice from "@/Components/Shared/InternalCreateNotice";
import { INTERNAL_USER_FLOWS } from "@/lib/user-creation";

export default function Page() {
  const flow = INTERNAL_USER_FLOWS.platformAdminInvite;

  return (
    <div className="space-y-6">
      <InternalCreateNotice
        title={flow.title}
        description={flow.description}
        actionLabel="Invite admin"
      />
      <PlaceholderPage columns={["Name", "Email", "Role", "Status"]} />
    </div>
  );
}
