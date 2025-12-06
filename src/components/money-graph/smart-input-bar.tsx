"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";

interface SmartInputBarProps {
  onSubmit: (input: string) => Promise<void>;
}

export function SmartInputBar({ onSubmit }: SmartInputBarProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(input);
    setInput("");
    setIsSubmitting(false);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-20">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center"
      >
        <Sparkles className="absolute left-4 h-5 w-5 text-primary" />
        <Input
          type="text"
          placeholder="e.g., Paid 200 for Aman, Aditya and my dinner at Zomato"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          className="h-14 pl-12 pr-14 rounded-full bg-card/80 backdrop-blur-sm shadow-2xl text-base border-border/50 focus:border-primary/50"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 h-10 w-10 rounded-full"
          disabled={isSubmitting || !input.trim()}
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Submit</span>
        </Button>
      </form>
    </div>
  );
}
