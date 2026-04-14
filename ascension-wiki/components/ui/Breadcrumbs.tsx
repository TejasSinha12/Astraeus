"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
    const pathname = usePathname();
    if (pathname === "/") return null;

    const paths = pathname.split("/").filter(Boolean);
    
    return (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-muted/60 mb-6 px-1">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home size={10} />
                <span>ROOT</span>
            </Link>
            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join("/")}`;
                const isLast = index === paths.length - 1;
                
                return (
                    <div key={href} className="flex items-center space-x-2">
                        <ChevronRight size={10} className="text-muted/20" />
                        {isLast ? (
                            <span className="text-primary font-bold">{path.replace(/-/g, " ")}</span>
                        ) : (
                            <Link href={href} className="hover:text-primary transition-colors">
                                {path.replace(/-/g, " ")}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
