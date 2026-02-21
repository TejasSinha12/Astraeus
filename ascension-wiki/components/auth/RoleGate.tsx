"use client";

import { useUser } from "@clerk/nextjs";
import type { UserRole } from "@/lib/roles";

interface RoleGateProps {
    allowedRole: UserRole;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const ROLE_HIERARCHY: UserRole[] = ["viewer", "researcher", "admin"];

/**
 * Client-side role gate — renders children only if the signed-in user
 * has the required role or higher. Renders `fallback` (or nothing) otherwise.
 */
export function RoleGate({ allowedRole, children, fallback }: RoleGateProps) {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return null;

    const userRole = (user?.publicMetadata?.role as UserRole) ?? "viewer";
    const hasAccess =
        ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(allowedRole);

    if (!hasAccess) {
        return (
            fallback ?? (
                <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl border border-red-500/20 text-center gap-3">
                    <div className="text-5xl">🔒</div>
                    <h3 className="text-lg font-bold text-white">Access Restricted</h3>
                    <p className="text-muted text-sm max-w-sm">
                        You need <span className="text-primary font-mono">{allowedRole}</span> privileges to view this section.
                        Contact an administrator to upgrade your access level.
                    </p>
                </div>
            )
        );
    }

    return <>{children}</>;
}
