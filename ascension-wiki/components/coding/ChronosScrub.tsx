"use client";

import { motion } from "framer-motion";
import { Clock, Play, Pause, FastForward, Rewind, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TraceStep {
    step: number;
    label: string;
    role: string;
}

interface ChronosScrubProps {
    steps: TraceStep[];
    currentStep: number;
    onStepChange: (index: number) => void;
    isPlaying?: boolean;
    onTogglePlay?: () => void;
}

export function ChronosScrub({ steps, currentStep, onStepChange, isPlaying, onTogglePlay }: ChronosScrubProps) {
    if (steps.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Clock size={12} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] font-black">Neural Replay Engine</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-primary font-bold">
                        STEP {String(currentStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                    </span>
                    <div className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest border border-primary/30">
                        {steps[currentStep]?.label || "Processing"}
                    </div>
                </div>
            </div>

            {/* Main Scrubber */}
            <div className="relative group p-2">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                    {/* Active Track */}
                    <motion.div
                        initial={false}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        className="absolute h-full bg-gradient-to-r from-primary/40 to-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    />
                </div>

                {/* Visual Step Markers */}
                <div className="absolute inset-0 flex items-center justify-between px-2 gap-0.5">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onStepChange(i)}
                            className={cn(
                                "flex-1 h-3 rounded-sm transition-all duration-300",
                                i <= currentStep ? "bg-primary/20" : "bg-transparent group-hover:bg-white/5"
                            )}
                        />
                    ))}
                </div>

                {/* Range Input for fine scrubbing */}
                <input
                    type="range"
                    min={0}
                    max={steps.length - 1}
                    value={currentStep}
                    onChange={(e) => onStepChange(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8 mt-1">
                <button
                    onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                    className="p-1 text-muted hover:text-white transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    onClick={onTogglePlay}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>

                <button
                    onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
                    className="p-1 text-muted hover:text-white transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
