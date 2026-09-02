import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/navigation";

export async function requirePlatformAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  if (session.user.role !== ROLES.PLATFORM_ADMIN) {
    return { error: "Only a Main Platform Admin can manage NGOs.", status: 403 };
  }

  return { session };
}
