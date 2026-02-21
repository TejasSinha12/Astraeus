import { auth, currentUser } from "@clerk/nextjs/server";

export type UserRole = "admin" | "researcher" | "viewer";

/**
 * Returns the role from the current user's Clerk public metadata.
 * Falls back to "viewer" if no role is set.
 */
export async function getUserRole(): Promise<UserRole> {
    const user = await currentUser();
    if (!user) return "viewer";
    const role = (user.publicMetadata?.role as UserRole) ?? "viewer";
    return role;
}

/**
 * Returns true if the current user has the given role or higher privilege.
 * Hierarchy: admin > researcher > viewer
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
    const role = await getUserRole();
    const hierarchy: UserRole[] = ["viewer", "researcher", "admin"];
    return hierarchy.indexOf(role) >= hierarchy.indexOf(requiredRole);
}

/**
 * Returns the current user's Clerk userId or null if unauthenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
    const { userId } = await auth();
    return userId;
}
