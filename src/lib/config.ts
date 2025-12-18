// src/lib/config.ts
export const ORGANIZATION_ID =
  (import.meta.env.VITE_ORGANIZATION_ID as string | undefined)?.trim() ?? "";

export const HAS_ORGANIZATION = ORGANIZATION_ID.length > 0;
