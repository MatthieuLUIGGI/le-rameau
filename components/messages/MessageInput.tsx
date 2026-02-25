"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface MessageInputProps {
    canalName?: string;
    onSend: (text: string) => Promise<void>;
}

export function MessageInput({ canalName = "général", onSend }: MessageInputProps) {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!text.trim() || isSending) return;
        setIsSending(true);
        try {
            await onSend(text);
            setText("");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 bg-surface border-t border-border">
            <div className="bg-slate-50 border border-border rounded-xl flex items-end p-2 gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 h-10 w-10">
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Envoyer un message à #${canalName}...`}
                    className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-0 py-2 focus-visible:ring-0 w-full text-sm"
                    rows={1}
                />
                <Button
                    onClick={handleSend}
                    disabled={!text.trim() || isSending}
                    size="icon"
                    className="shrink-0 rounded-full bg-primary hover:bg-primary-light h-10 w-10 transition-colors"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
