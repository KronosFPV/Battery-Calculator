import * as React from "react"

export function Alert({ children, variant = "default", className = "" }) {
  const baseStyles = "rounded-lg border p-4"
  const variantStyles = {
    default: "bg-white text-gray-900 border-gray-200",
    destructive: "border-red-500/50 text-red-500 dark:border-red-500 bg-red-50"
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ children, className = "" }) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  )
}
