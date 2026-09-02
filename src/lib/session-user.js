import { ALL_MODULES, DESIGNATIONS, ROLES } from "./navigation";

export const ROLE_LABELS = {
  [ROLES.PLATFORM_ADMIN]: "Main Platform Admin",
  [ROLES.NGO_ADMIN]: "NGO Admin",
  [ROLES.WORKER]: "Worker / Employee",
};

export const DESIGNATION_LABELS = {
  [DESIGNATIONS.STORE_LOGISTICS_OFFICER]: "Store / Logistics Officer",
  [DESIGNATIONS.FIELD_WORKER]: "Field Worker",
  [DESIGNATIONS.PROJECT_WORKER]: "Project Worker",
  [DESIGNATIONS.DATA_ENTRY_OFFICER]: "Data Entry Officer",
};

function initialsFromName(name) {
  return (name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function sessionToAccess(user) {
  if (!user) return null;

  const role = Object.values(ROLES).includes(user.role) ? user.role : ROLES.PLATFORM_ADMIN;
  const designation = user.designation ?? null;
  const designationLabel = DESIGNATION_LABELS[designation] ?? null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    roleLabel: ROLE_LABELS[role],
    orgName: user.ngoName || (role === ROLES.PLATFORM_ADMIN ? "ORVIX Platform" : "Your NGO"),
    orgHint: designationLabel ?? (role === ROLES.PLATFORM_ADMIN ? "All NGOs" : ROLE_LABELS[role]),
    designation,
    designationLabel,
    enabledModules: Array.isArray(user.enabledModules)
      ? user.enabledModules
      : role === ROLES.PLATFORM_ADMIN
        ? []
        : ALL_MODULES,
    permissions: user.permissions ?? [],
    initials: initialsFromName(user.name),
    mfaEnabled: Boolean(user.mfaEnabled),
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    sharePointEnabled: Boolean(user.sharePointEnabled),
  };
}
