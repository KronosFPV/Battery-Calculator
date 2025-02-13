import * as React from "react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export function Alert({ children, className = "" }: AlertProps) {
  return (
    <div className={`rounded-lg border p-4 bg-red-50 border-red-500 text-red-700 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = "" }: AlertProps) {
  return (
    <p className={`text-sm text-red-600 ${className}`}>
      {children}
    </p>
  );
}
