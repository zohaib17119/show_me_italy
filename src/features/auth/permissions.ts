export function hasPermission(
  userPermissions: string[] | undefined | null,
  key: string,
): boolean {
  if (!userPermissions?.length) return false;
  return userPermissions.includes(key);
}

export function hasAnyPermission(
  userPermissions: string[] | undefined | null,
  keys: string[],
): boolean {
  if (!userPermissions?.length || keys.length === 0) return false;
  return keys.some((key) => userPermissions.includes(key));
}
