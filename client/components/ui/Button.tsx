"use client";

import { Loader2 } from "lucide-react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex
        h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-slate-950
        px-5
        text-sm
        font-semibold
        text-white
        shadow-sm
        transition-all
        duration-200
        hover:bg-slate-800
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-slate-950
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}

      {children}
    </button>
  );
}