"use client";

import { useRef, useCallback, useEffect, type KeyboardEvent, type ChangeEvent } from "react";

interface ChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
}

export function ChatInput({
  input,
  onChange,
  onSubmit,
  sending,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const placeholderText = "Ask anything...";

  return (
    <div className="w-full max-w-[768px] mx-auto px-4 pb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="relative flex items-end gap-2 rounded-2xl border border-[#E5E5E5] bg-white px-4 py-2 shadow-sm transition-all duration-150 focus-within:border-[#D0D0D0] focus-within:shadow-md dark:border-[#444] dark:bg-[#1F1F1F] dark:focus-within:border-[#666]"
      >
        {/* Plus button */}
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8E8EA0] transition hover:bg-[#F0F0F0] dark:hover:bg-[#333]"
          aria-label="Add files"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          className="max-h-[200px] min-h-[36px] flex-1 resize-none overflow-y-auto bg-transparent py-2 font-body text-[15px] leading-[1.5] outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-[#666] dark:text-[#ECECF1]"
          placeholder={placeholderText}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
            input.trim() && !sending
              ? "bg-[#10A37F] text-white shadow-sm hover:bg-[#0E8C6E]"
              : "bg-[#F0F0F0] text-[#8E8EA0] dark:bg-[#333]"
          } disabled:cursor-not-allowed`}
        >
          {sending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
