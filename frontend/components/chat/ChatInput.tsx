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

  const placeholderText = "Type your message here...";

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 sm:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="relative flex min-h-[76px] items-end gap-2 rounded-2xl border border-[#CBD8D5] bg-white px-3 py-3 shadow-sm transition-all duration-150 focus-within:border-teal-600 focus-within:shadow-md dark:border-[#444] dark:bg-[#1F1F1F] dark:focus-within:border-teal-600"
      >
        {/* Plus button */}
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper-2 dark:hover:bg-[#333]"
          aria-label="Add files"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 16l4.5-4.5 3 3L16 10l4 4M5 5h14v14H5z" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          className="max-h-[200px] min-h-[46px] flex-1 resize-none overflow-y-auto bg-transparent px-1 py-2 font-body text-[13px] leading-[1.5] outline-none placeholder:text-[#7C8885] dark:text-[#ECECF1] dark:placeholder:text-[#777]"
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
              ? "rounded-full bg-teal-700 text-white shadow-sm hover:bg-teal-900"
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
