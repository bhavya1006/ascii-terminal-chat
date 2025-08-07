"use client"

import { useState, useEffect } from "react"
import Terminal from "@/components/terminal"
import { SocketProvider } from "@/contexts/socket-context"

export default function Home() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isBooting) {
    return <BootSequence />
  }

  return (
    <SocketProvider>
      <Terminal />
    </SocketProvider>
  )
}

function BootSequence() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const bootLines = [
      "ASCII Terminal Chat v1.0.0",
      "Initializing system...",
      "Loading ASCII art engine...",
      "Connecting to chat servers...",
      "Starting WebSocket connection...",
      "System ready.",
      "",
      "Welcome to ASCII Terminal Chat!",
    ]

    let currentLine = 0
    const interval = setInterval(() => {
      if (currentLine < bootLines.length) {
        setLines((prev) => [...prev, bootLines[currentLine]])
        currentLine++
      } else {
        clearInterval(interval)
      }
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line && <span className="mr-2">{">"}</span>}
            {line}
            {index === lines.length - 1 && <span className="animate-pulse">_</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
