import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ROLES } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
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
});
