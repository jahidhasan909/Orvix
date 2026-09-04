import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { apiOrigin } from "@/lib/api";

export const authClient = createAuthClient({
    baseURL: apiOrigin() || undefined,
    plugins: [
        twoFactorClient({
            onTwoFactorRedirect() {},
        }),
    ],
});
