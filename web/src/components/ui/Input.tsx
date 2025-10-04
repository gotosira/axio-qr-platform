"use client";
import { twMerge } from "tailwind-merge";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", left, right, value, ...props }, ref) => {
    // Convert null values to empty string to prevent React warnings
    const safeValue = value === null ? "" : value;
    if (left || right) {
      return (
        <div className={twMerge(
          "flex items-center gap-2 h-9 w-full rounded-lg border border-border bg-input px-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}>
          {left}
          <input
            type={type}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            ref={ref}
            value={safeValue}
            {...props}
          />
          {right}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={twMerge(
          "flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={safeValue}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };


