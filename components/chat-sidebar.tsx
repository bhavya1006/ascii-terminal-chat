"use client"

import { useEffect, useRef } from "react"
import type { Message, Theme } from "@/types"
import { convertToAscii } from "@/utils/ascii-utils"

interface ChatSidebarProps {
  messages: Message[]
  draftMessages: string[]
  currentView: "chat" | "draft"
  currentRoom: string
  theme: Theme
  isConnected: boolean
}

export default function ChatSidebar({
  messages,
  draftMessages,
  currentView,
  currentRoom,
  theme,
  isConnected,
}: ChatSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, draftMessages])

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="w-80 border-r border-gray-600 flex flex-col">
      <div className={`p-2 border-b border-gray-600 ${theme.accent} flex justify-between items-center`}>
        <div className="flex space-x-4">
          <span className={`px-2 py-1 ${currentView === "chat" ? "bg-gray-700" : ""}`}>[c] chat</span>
          <span className={`px-2 py-1 ${currentView === "draft" ? "bg-gray-700" : ""}`}>[d] draft</span>
        </div>
        <div className="text-xs">{isConnected ? "●" : "○"}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-200px)] terminal-scroll">
        {currentView === "chat" ? (
          messages.map((message) => (
            <div key={message.id} className="break-words">
              <div className={`text-xs ${theme.accent} mb-1`}>
                [{formatTimestamp(message.timestamp)}] {message.sender}:
              </div>
              <div className="text-sm">
                {message.isAscii ? (
                  <pre className="whitespace-pre-wrap text-xs leading-tight">{convertToAscii(message.content)}</pre>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className={`text-sm ${theme.accent} mb-2`}>Draft Messages ({draftMessages.length}):</div>
            {draftMessages.length === 0 ? (
              <div className="text-xs opacity-60">
                No draft messages
                <br />
                <br />
                Tip: Type messages without 'figlet' prefix to save as drafts
              </div>
            ) : (
              draftMessages.map((draft, index) => (
                <div key={index} className="text-sm mb-2 p-2 bg-gray-800 rounded border-l-2 border-yellow-500">
                  <div className="text-xs opacity-60 mb-1">Draft #{index + 1}</div>
                  {draft}
                </div>
              ))
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-2 border-t border-gray-600 text-xs ${theme.accent}`}>Room: #{currentRoom}</div>
    </div>
  )
}
