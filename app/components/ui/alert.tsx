import * as React from "react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDescription({ children, className = "" }: AlertProps) {
  return (
    <p className={`text-sm text-red-600 ${className}`}>
      {children}
    </p>
  );
}

