import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, twoFactor } from "better-auth/plugins";
import { ROLES } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    appName: "ORVIX",
    emailAndPassword: {
        enabled: true,
    },
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
                    mfaEnabled: Boolean(ngo?.mfaEnabled),
                    twoFactorEnabled: Boolean(user.twoFactorEnabled),
                    sharePointEnabled: Boolean(ngo?.sharePointEnabled),
                },
            };
        }),
    ],
});
