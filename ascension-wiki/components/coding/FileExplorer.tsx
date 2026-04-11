"use client";

import { motion } from "framer-motion";
import { Folder, FileCode, ChevronRight, FileJson, FileType2, FileTerminal, FileText } from "lucide-react";
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

    // Dynamic Icon Mapper (Commit 6)
    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'ts':
            case 'tsx':
                return <FileType2 size={14} className="text-blue-400 shrink-0" />;
            case 'js':
            case 'jsx':
                return <FileCode size={14} className="text-yellow-400 shrink-0" />;
            case 'json':
                return <FileJson size={14} className="text-green-400 shrink-0" />;
            case 'py':
                return <FileTerminal size={14} className="text-blue-500 shrink-0" />;
            case 'md':
                return <FileText size={14} className="text-zinc-400 shrink-0" />;
            default:
                return <FileCode size={14} className="text-muted shrink-0" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/40 border-r border-white/5 overflow-y-auto custom-scrollbar relative">
            {/* Sticky Breadcrumb (Commit 8) */}
            <div className="p-4 border-b border-white/5 bg-background/90 backdrop-blur-md sticky top-0 z-20 flex flex-col gap-2">
                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Folder size={10} className="text-primary" /> Workspace Tree
                </h4>
                {selectedFile && (
                    <div className="text-[8px] font-mono text-primary/70 bg-primary/5 px-2 py-1 rounded truncate border border-primary/20">
                        {selectedFile}
                    </div>
                )}
            </div>
            
            <div className="py-2">
                {filenames.map((filename, index) => {
                    const extension = filename.split('.').pop()?.toLowerCase();
                    const isSelected = selectedFile === filename;

                    return (
                        <motion.button
                            key={filename}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }} // Stagger (Commit 7)
                            onClick={() => onFileSelect(filename)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-[11px] font-mono transition-all group border-l-2",
                                isSelected
                                    ? "bg-primary/10 text-primary border-primary"
                                    : "text-muted hover:text-white hover:bg-primary/5 border-transparent" // Hover interaction Polish (Commit 9)
                            )}
                        >
                            {/* Native mapped Icon */}
                            {getFileIcon(filename)}
                            <span className="truncate">{filename}</span>
                            {isSelected && (
                                <motion.div
                                    layoutId="active-file-glow"
                                    className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(0,229,255,0.8)]" // Heavy Glow Box-shadow (Commit 10)
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
