import { NextResponse } from "next/server";
import { generateMockLog } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send initial batch
            for (let i = 0; i < 5; i++) {
                const log = generateMockLog();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
            }

            // Stream new logs periodically
            const interval = setInterval(() => {
                try {
                    const log = generateMockLog();
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
                } catch {
                    clearInterval(interval);
                }
            }, 900);

            // Auto-close after 5 minutes to prevent memory leaks
            setTimeout(() => {
                clearInterval(interval);
                controller.close();
            }, 300_000);
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
