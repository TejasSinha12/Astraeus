export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="text-7xl font-bold font-mono text-primary/30">404</div>
            <h1 className="text-2xl font-bold text-white">System Path Not Found</h1>
            <p className="text-muted max-w-sm">The route you requested does not exist in the framework architecture.</p>
            <a href="/" className="px-6 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors mt-2">
                Return to Base
            </a>
        </div>
    );
}
