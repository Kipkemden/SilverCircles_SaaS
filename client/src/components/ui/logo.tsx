import React from "react";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  textClassName?: string;
}

export function Logo({
  className = "",
  size = "md",
  withText = true,
  textClassName = ""
}: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <Link href="/">
      <div className="flex items-center space-x-2 cursor-pointer">
        <svg className={`${sizes[size]} text-primary ${className}`} viewBox="0 0 40 40" fill="currentColor">
          <path d="M20 2C10.059 2 2 10.059 2 20s8.059 18 18 18 18-8.059 18-18S29.941 2 20 2zm0 4c7.732 0 14 6.268 14 14s-6.268 14-14 14S6 27.732 6 20 12.268 6 20 6zm0 4c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10z"/>
        </svg>
        {withText && (
          <h1 className={`font-bold text-primary ${textSizes[size]} ${textClassName}`}>
            Silver Circles
          </h1>
        )}
      </div>
    </Link>
  );
}
