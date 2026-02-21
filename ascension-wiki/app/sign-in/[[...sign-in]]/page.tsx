import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Header */}
                <div className="text-center mb-2">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-primary rounded-full animate-pulse opacity-50" />
                            <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                        </div>
                        <span className="text-xl font-bold tracking-widest text-white">ASCENSION</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-white">Access the Research Portal</h1>
                    <p className="text-muted text-sm mt-1">Authenticate to continue</p>
                </div>

                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "shadow-none",
                            card: "bg-surface/60 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(0,229,255,0.05)] rounded-2xl",
                            headerTitle: "text-white",
                            headerSubtitle: "text-muted",
                            formFieldLabel: "text-muted text-xs uppercase tracking-widest",
                            formFieldInput: "bg-background border-white/10 text-white rounded-lg focus:ring-1 focus:ring-primary focus:border-primary",
                            formButtonPrimary: "bg-primary hover:bg-primary/90 text-background font-bold rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all",
                            footerActionLink: "text-primary hover:text-primary/80",
                            dividerLine: "bg-white/10",
                            dividerText: "text-muted",
                            socialButtonsBlockButton: "border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all",
                        }
                    }}
                />
            </div>
        </div>
    );
}
