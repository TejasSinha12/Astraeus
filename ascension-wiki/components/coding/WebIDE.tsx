"use client";

import Editor from "@monaco-editor/react";
import { Loader2, Code2 } from "lucide-react";
import { motion } from "framer-motion";

interface WebIDEProps {
    code: string;
    filename: string;
}

export function WebIDE({ code, filename }: WebIDEProps) {
    // Infer language from filename
    const getLanguage = (fname: string) => {
        const ext = fname.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
                return 'javascript';
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'py':
                return 'python';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'json':
                return 'json';
            case 'md':
                return 'markdown';
            case 'go':
                return 'go';
            case 'rs':
                return 'rust';
            default:
                return 'plaintext';
        }
    };

    return (
        <div className="h-full w-full bg-[#0a0a0a] flex flex-col relative z-10 shadow-[0_4px_40px_-5px_rgba(0,0,0,0.8)] border-x border-white/5">
            {/* 1. Dynamic Sticky Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-primary opacity-70" />
                    <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">{filename || "untitled"}</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-white/50 uppercase tracking-widest">
                    {getLanguage(filename)}
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    path={filename}
                    defaultLanguage={getLanguage(filename)}
                    defaultValue={code}
                    value={code}
                    options={{
                        readOnly: true,
                        minimap: { enabled: true },
                        fontSize: 13,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', monospace",
                        /* 2. & 3. Monaco Cursor and Highlights */
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        renderLineHighlight: "all",
                        cursorWidth: 2,
                    }}
                    loading={
                        /* 4. Motion Transition over Loader */
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="h-full flex flex-col items-center justify-center bg-[#0a0a0a] gap-3 font-mono absolute inset-0 z-30"
                        >
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-[10px] text-primary/60 uppercase tracking-widest font-bold drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">Initializing Virtual Core...</span>
                        </motion.div>
                    }
                />
            </div>
        </div>
    );
}
