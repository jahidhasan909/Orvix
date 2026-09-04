import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, twoFactor } from "better-auth/plugins";
import { ROLES } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

function originFrom(value) {
  if (!value) return null;
  try {
    const url = /^https?:\/\//i.test(String(value))
      ? new URL(value)
      : new URL(`https://${value}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function appOrigin() {
  return (
    originFrom(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    originFrom(process.env.VERCEL_URL) ||
    originFrom(process.env.BETTER_AUTH_URL) ||
    originFrom(process.env.NEXT_PUBLIC_APP_URL)
  );
}

function requestOrigins(request) {
  const origins = new Set();
  try {
    origins.add(new URL(request.url).origin);
  } catch {}
  const host = String(request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .trim();
  const proto = String(request.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
  if (host) origins.add(`${proto}://${host}`);
  return [...origins];
}

const skipLoginTwoFactor = {
    id: "skip-login-two-factor",
    hooks: {
        after: [
            {
                matcher: (context) =>
                    context.path === "/sign-in/email" ||
                    context.path === "/sign-in/username" ||
                    context.path === "/sign-in/phone-number",
                handler: createAuthMiddleware(async (ctx) => {
                    if (ctx.context.newSession?.user) {
                        ctx.context.newSession.user.twoFactorEnabled = false;
                    }
                }),
            },
        ],
    },
};

export const auth = betterAuth({
    appName: "ORVIX",
    baseURL: appOrigin() || "http://localhost:3000",
    advanced: {
        trustedProxyHeaders: true,
    },
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
    },
    trustedOrigins: async (request) =>
        Array.from(
            new Set(
                [
                    appOrigin(),
                    originFrom(process.env.BETTER_AUTH_URL),
                    originFrom(process.env.NEXT_PUBLIC_APP_URL),
                    originFrom(process.env.VERCEL_PROJECT_PRODUCTION_URL),
                    originFrom(process.env.VERCEL_URL),
                    originFrom(process.env.VERCEL_BRANCH_URL),
                    "https://orvix-pi.vercel.app",
                    "https://*.vercel.app",
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    ...requestOrigins(request),
                ].filter(Boolean)
            )
        ),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: ROLES.PLATFORM_ADMIN,
                input: false,
            },
            designation: {
                type: "string",
                required: false,
                input: false,
            },
            ngoId: {
                type: "string",
                required: false,
                input: false,
            },
            twoFactorEnabled: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
            mfaEnabled: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
            extraPermissions: {
                type: "string[]",
                required: false,
                input: false,
            },
            assignedProjectIds: {
                type: "string[]",
                required: false,
                input: false,
            },
            assignedSiteIds: {
                type: "string[]",
                required: false,
                input: false,
            },
            designationOther: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => ({
                    data: {
                        ...user,
                        role: ROLES.PLATFORM_ADMIN,
                    },
                }),
            },
        },
    },
    plugins: [
        skipLoginTwoFactor,
        twoFactor({
            issuer: "ORVIX",
        }),
        customSession(async ({ user, session }) => {
            if (!user.ngoId) {
                return { user, session };
            }

            const ngo = await prisma.ngo.findUnique({
                where: { id: user.ngoId },
                select: {
                    name: true,
                    enabledModules: true,
                    status: true,
                    mfaEnabled: true,
                    sharePointEnabled: true,
                },
            });

            return {
                session,
                user: {
                    ...user,
                    ngoName: ngo?.name ?? null,
                    enabledModules: ngo?.enabledModules ?? [],
                    ngoStatus: ngo?.status ?? null,
                    mfaEnabled: user.role === ROLES.NGO_ADMIN
                        ? Boolean(ngo?.mfaEnabled)
                        : Boolean(user.mfaEnabled),
                    twoFactorEnabled: Boolean(user.twoFactorEnabled),
                    sharePointEnabled: Boolean(ngo?.sharePointEnabled),
                    permissions: Array.isArray(user.extraPermissions) ? user.extraPermissions : [],
                    assignedProjectIds: Array.isArray(user.assignedProjectIds) ? user.assignedProjectIds : [],
                    assignedSiteIds: Array.isArray(user.assignedSiteIds) ? user.assignedSiteIds : [],
                    designationOther: user.designationOther ?? null,
                },
            };
        }),
    ],
});
