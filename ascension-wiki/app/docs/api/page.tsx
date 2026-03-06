"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function APIDocsPage() {
    const [isLoading, setIsLoading] = useState(true);
    // Default to production API URL if NEXT_PUBLIC_PLATFORM_API_URL isn't set
    const [apiUrl, setApiUrl] = useState("https://astraeus-r4pf.onrender.com");

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_PLATFORM_API_URL) {
            setApiUrl(process.env.NEXT_PUBLIC_PLATFORM_API_URL);
        }
    }, []);

    return (
        <div className="w-full h-screen pt-16 flex flex-col bg-white">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background text-primary">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-mono text-sm">Loading Interactive Swagger UI...</p>
                </div>
            )}
            <iframe
                src={`${apiUrl}/docs`}
                className="w-full flex-grow border-none"
                onLoad={() => setIsLoading(false)}
                title="Astraeus API Documentation"
            />
        </div>
    );
}
