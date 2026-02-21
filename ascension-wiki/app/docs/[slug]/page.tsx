import { getDocBySlug, getAllDocSlugs } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateStaticParams() {
    const slugs = await getAllDocSlugs();
    return slugs.map((slug) => ({ slug }));
}

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
            <div className="p-4 rounded-xl glass-card border-l-4 border-primary text-sm my-6">
                {props.children}
            </div>
        ),
    };

    return (
        <article className="max-w-4xl mx-auto px-6 lg:px-12 py-16 md:py-24 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-8 tracking-widest uppercase">
                <Link href="/" className="hover:text-primary transition-colors">Documentation</Link>
                <ChevronRight size={14} />
                <span className="text-white">{slug.replace("-", " ")}</span>
            </div>

            <div className="mb-12 border-b border-white/10 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                    {doc.meta.title || slug}
                </h1>
                {doc.meta.description && (
                    <p className="text-xl text-muted leading-relaxed">
                        {doc.meta.description}
                    </p>
                )}
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
                <MDXRemote source={doc.content} components={components} />
            </div>
        </article>
    );
}
