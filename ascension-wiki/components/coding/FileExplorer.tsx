"use client";

import { motion } from "framer-motion";
import { Folder, FileCode, ChevronRight, ChevronDown, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
    fileMap: Record<string, string>;
    selectedFile: string | null;
    onFileSelect: (filename: string) => void;
}

export function FileExplorer({ fileMap, selectedFile, onFileSelect }: FileExplorerProps) {
    const filenames = Object.keys(fileMap).sort();

    if (filenames.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest bg-white/5 py-2 rounded">
                    Single File Archive
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/40 border-r border-white/5 overflow-y-auto custom-scrollbar">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Folder size={10} className="text-primary" /> Workspace Tree
                </h4>
            </div>
            <div className="py-2">
                {filenames.map((filename) => {
                    const extension = filename.split('.').pop()?.toLowerCase();
                    const isSelected = selectedFile === filename;

                    return (
                        <button
                            key={filename}
                            onClick={() => onFileSelect(filename)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-[11px] font-mono transition-all group border-l-2",
                                isSelected
                                    ? "bg-primary/10 text-primary border-primary"
                                    : "text-muted hover:text-white hover:bg-white/[0.03] border-transparent"
                            )}
                        >
                            <FileCode
                                size={14}
                                className={cn(
                                    "shrink-0 transition-colors",
                                    isSelected ? "text-primary" : "text-muted group-hover:text-primary/70"
                                )}
                            />
                            <span className="truncate">{filename}</span>
                            {isSelected && (
                                <motion.div
                                    layoutId="active-file-glow"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary box-glow"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
