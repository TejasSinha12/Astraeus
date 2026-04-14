"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-16 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-primary via-primary to-secondary"
            style={{ scaleX }}
            aria-hidden="true"
        />
    );
}
