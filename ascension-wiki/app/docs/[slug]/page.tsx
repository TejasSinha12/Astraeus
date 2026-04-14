import { getDocBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// Force dynamic rendering — Clerk context requires a real request
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);
    if (!doc) return { title: "Not Found" };

    return {
        title: `${doc.meta.title || slug} | Project Ascension`,
    };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);

    if (!doc) {
        notFound();
    }

    const components = {
        // Custom MDX components can be defined here, e.g. for Alerts or animated elements
        Alert: (props: any) => (
            <div className="p-4 rounded-xl glass-card border-l-4 border-primary text-sm my-6 bg-primary/5">
                {props.children}
            </div>
        ),
    };

    // Commit 21: Estimated Reading Time calculation (Approx 200 wpm)
    const wordCount = doc.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <article className="max-w-4xl mx-auto px-6 lg:px-12 py-16 md:py-24 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-8 tracking-widest uppercase">
                <Link href="/" className="hover:text-primary transition-colors">Documentation</Link>
                <ChevronRight size={14} />
                <span className="text-white">{slug.replace("-", " ")}</span>
            </div>

            <div className="mb-12 border-b border-white/10 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 drop-shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                    {doc.meta.title || slug}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-muted/60 uppercase tracking-widest mb-8">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-primary" />
                        <span>{readingTime} MIN READ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-primary" />
                        <span>UPDATED: APRIL 2026</span>
                    </div>
                </div>

                {doc.meta.description && (
                    <p className="text-xl text-muted leading-relaxed font-sans">
                        {doc.meta.description}
                    </p>
                )}
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
                <MDXRemote source={doc.content} components={components} />
            </div>

            {/* Commit 23: Next / Previous Article Navigation */}
            <div className="mt-20 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/docs/core" className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest block mb-2">Previous Module</span>
                    <div className="flex items-center gap-3 text-white group-hover:text-primary transition-colors">
                        <ArrowLeft size={16} />
                        <span className="font-bold uppercase tracking-tight">Core Cognition Architecture</span>
                    </div>
                </Link>
                <Link href="/docs/memory" className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-right">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest block mb-2">Next Module</span>
                    <div className="flex items-center justify-end gap-3 text-white group-hover:text-primary transition-colors">
                        <span className="font-bold uppercase tracking-tight">Memory Systems & Vectorization</span>
                        <ArrowRight size={16} />
                    </div>
                </Link>
            </div>
        </article>
    );
}
