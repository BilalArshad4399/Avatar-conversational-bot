"use client"

import { useEffect, useState } from "react"

interface AudioVisualizerProps {
  isActive: boolean
  level: number
}

export function AudioVisualizer({ isActive, level }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0))

  useEffect(() => {
    if (!isActive) {
      setBars(Array(20).fill(0))
      return
    }

    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => Math.random() * 100))
    }, 100)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="h-16 bg-slate-800 rounded-lg flex items-center justify-center p-4">
      <div className="flex items-end gap-1 h-8">
        {bars.map((height, index) => (
          <div
            key={index}
            className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-150"
            style={{
              height: isActive ? `${Math.max(height, 10)}%` : "10%",
              animationDelay: `${index * 50}ms`,
            }}
          />
        ))}
      </div>
      {isActive && (
        <div className="ml-4 text-slate-300 text-sm">
          {level > 0 ? `Level: ${Math.round(level * 100)}%` : "Listening..."}
        </div>
      )}
    </div>
  )
}
