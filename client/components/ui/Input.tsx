"use client";

import { forwardRef } from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-800"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={`
            h-13
            w-full
            rounded-xl
            border
            bg-white
            px-4
            text-sm
            text-slate-950
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-slate-950
            focus:ring-4
            focus:ring-slate-950/5
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-200"
            }
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;