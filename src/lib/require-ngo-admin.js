import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/navigation";

export async function requireNgoAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  if (session.user.role !== ROLES.NGO_ADMIN || !session.user.ngoId) {
    return { error: "Only an NGO Admin can manage this organization.", status: 403 };
  }

  return { session, ngoId: session.user.ngoId };
}
