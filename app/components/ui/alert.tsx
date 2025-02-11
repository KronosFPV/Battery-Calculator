import * as React from "react"

export function Alert({ children, className = "" }) {
  return (
    <div className={`rounded-lg border p-4 bg-red-50 border-red-500 text-red-700 ${className}`}>
      {children}
    </div>
  )
}

export function AlertDescription({ children, className = "" }) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  )
}
