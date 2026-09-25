/** Prefix public assets when building for a project subdirectory. */
export const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
