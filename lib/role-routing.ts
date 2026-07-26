export function destinationForRoles(roles: string[]): string {
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) return "/admin";
  if (roles.includes("LECTURER") || roles.includes("HOD")) return "/staff";
  if (roles.includes("STUDENT")) return "/dashboard";
  return "/unsupported-role";
}

export function roleAllowedIn(roles: string[], area: "student" | "admin" | "staff"): boolean {
  if (area === "student") return roles.includes("STUDENT");
  if (area === "admin") return roles.includes("SUPER_ADMIN") || roles.includes("ADMIN");
  if (area === "staff") return roles.includes("LECTURER") || roles.includes("HOD");
  return false;
}
