"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * High-performance AGI Lab Cursor System.
 * Uses requestAnimationFrame for zero-lag interpolation.
 * Magnetic outer ring + delayed inner dot + intelligent hover states.
 */
export function CustomCursor() {
    const innerRef = useRef<HTMLDivElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(null);

    // Logical positions
    const mouse = useRef({ x: 0, y: 0 });
    const innerPos = useRef({ x: 0, y: 0 });
    const outerPos = useRef({ x: 0, y: 0 });

    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        // Detect touch device
        const touchQuery = window.matchMedia("(pointer: coarse)");
        setIsTouch(touchQuery.matches);
        if (touchQuery.matches) return;

        const onMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            if (!isVisible) setIsVisible(true);
        };

        const onMouseDown = () => setIsClicking(true);
        const onMouseUp = () => setIsClicking(false);

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInteractive =
                target.closest("button") ||
                target.closest("a") ||
                target.closest("input") ||
                target.closest("textarea") ||
                target.closest(".glass-card") ||
                target.closest(".react-flow__node") ||
                target.closest("[draggable='true']") ||
                target.classList.contains("clickable");

            if (isInteractive) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const animate = () => {
            // Lerp factors
            const innerLerp = 0.25;
            const outerLerp = 0.12;

            // Update inner dot (snappy but slight delay)
            innerPos.current.x += (mouse.current.x - innerPos.current.x) * innerLerp;
            innerPos.current.y += (mouse.current.y - innerPos.current.y) * innerLerp;

            // Update outer ring (smooth interpolation / trailing)
            outerPos.current.x += (mouse.current.x - outerPos.current.x) * outerLerp;
            outerPos.current.y += (mouse.current.y - outerPos.current.y) * outerLerp;

            if (innerRef.current) {
                innerRef.current.style.transform = `translate3d(${innerPos.current.x}px, ${innerPos.current.y}px, 0) translate(-50%, -50%)`;
            }
            if (outerRef.current) {
                outerRef.current.style.transform = `translate3d(${outerPos.current.x}px, ${outerPos.current.y}px, 0) translate(-50%, -50%)`;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("mouseover", onMouseOver);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mouseover", onMouseOver);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isVisible]);

    if (isTouch || prefersReducedMotion) return null;

    return (
        <div className={`fixed inset-0 pointer-events-none z-[9999] mix-blend-screen transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            {/* Outer Ring */}
            <div
                ref={outerRef}
                className="absolute top-0 left-0 w-10 h-10 rounded-full border border-primary/30 transition-all duration-300 ease-out flex items-center justify-center"
                style={{
                    width: isHovering ? "64px" : "40px",
                    height: isHovering ? "64px" : "40px",
                    boxShadow: isHovering ? "0 0 25px rgba(0, 229, 255, 0.4)" : "none",
                    backgroundColor: isHovering ? "rgba(0, 229, 255, 0.05)" : "transparent",
                }}
            >
                {/* Subtle Trailing Glow */}
                <div className="absolute inset-0 rounded-full opacity-20 bg-primary blur-xl animate-pulse" />
            </div>

            {/* Inner Dot */}
            <div
                ref={innerRef}
                className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-primary"
                style={{
                    scale: isClicking ? 0.6 : isHovering ? 1.5 : 1,
                    boxShadow: "0 0 12px rgba(0, 229, 255, 0.8)",
                    transition: "scale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
            />
        </div>
    );
}
