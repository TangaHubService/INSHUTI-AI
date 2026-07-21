"use client";

import { useState, type InputHTMLAttributes } from "react";

export function PasswordInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-10`} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-teal-700"
      >
        <svg width="18" height="18">
          <use href={visible ? "#i-eye-off" : "#i-eye"} />
        </svg>
      </button>
    </div>
  );
}
