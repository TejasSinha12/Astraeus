"use client";

import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

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
        <div className="h-full w-full bg-[#0a0a0a]">
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
                }}
                loading={
                    <div className="h-full flex flex-col items-center justify-center bg-black gap-3 font-mono">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-[10px] text-muted uppercase tracking-widest animate-pulse">Initializing Virtual Core...</span>
                    </div>
                }
            />
        </div>
    );
}
