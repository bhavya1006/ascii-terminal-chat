"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { User, Theme } from "@/types"

interface CommandInputProps {
  onCommand: (command: string) => void
  currentUser: User | null
  theme: Theme
}

export default function CommandInput({ onCommand, currentUser, theme }: CommandInputProps) {
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onCommand(input.trim())
      setCommandHistory((prev) => [...prev, input.trim()])
      setInput("")
      setHistoryIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput("")
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Basic tab completion for commands
      const commands = [
        "/figlet",
        "/d",
        "/c",
        "/meow",
        "/nyan",
        "/fire",
        "/train",
        "/help",
        "/themes",
        "/theme",
        "/join",
        "/draft",
        "/chat",
      ]
      const matches = commands.filter((cmd) => cmd.startsWith(input))
      if (matches.length === 1) {
        setInput(matches[0] + " ")
      }
    }
  }

  return (
    <div className="border-t border-gray-600 p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <span className={theme.accent}>{currentUser?.username || "guest"}@system [0]</span>
        <span className={theme.text}>$</span>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-inherit font-mono"
            placeholder="Type 'figlet [message]' to send, or just message for draft..."
            autoComplete="off"
          />
          {showCursor && <span className="absolute right-0 top-0 animate-pulse">_</span>}
        </div>
      </form>

      <div className={`text-xs ${theme.accent} opacity-60 mt-2`}>
        <span>figlet [msg] to send</span>
        <span className="ml-4">plain text → drafts</span>
        <span className="ml-4">↑↓ for history</span>
        <span className="ml-4">/d toggle drafts</span>
      </div>
    </div>
  )
}
