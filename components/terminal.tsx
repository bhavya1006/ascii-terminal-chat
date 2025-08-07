"use client"

import { useState, useEffect, useRef } from "react"
import ChatSidebar from "./chat-sidebar"
import Playground from "./playground"
import CommandInput from "./command-input"
import { useSocket } from "@/contexts/socket-context"
import type { Message, User } from "@/types"

const themes = {
  matrix: { bg: "bg-black", text: "text-green-400", accent: "text-green-300" },
  amber: { bg: "bg-black", text: "text-amber-400", accent: "text-amber-300" },
  cyan: { bg: "bg-gray-900", text: "text-cyan-400", accent: "text-cyan-300" },
  white: { bg: "bg-black", text: "text-white", accent: "text-gray-300" },
}

export default function Terminal() {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>("matrix")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draftMessages, setDraftMessages] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<"chat" | "draft">("chat")
  const [currentRoom, setCurrentRoom] = useState("general")
  const { socket, isConnected } = useSocket()
  const terminalRef = useRef<HTMLDivElement>(null)

  const theme = themes[currentTheme]

  useEffect(() => {
    // Auto-login for demo purposes
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: `user${Math.floor(Math.random() * 1000)}`,
      isOnline: true,
    }
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("message", (message: Message) => {
        setMessages((prev) => [...prev, message])
      })

      socket.on("user-joined", (user: User) => {
        const systemMessage: Message = {
          id: Date.now().toString(),
          content: `${user.username} joined the chat`,
          sender: "system",
          timestamp: new Date(),
          isAscii: false,
        }
        setMessages((prev) => [...prev, systemMessage])
      })

      return () => {
        socket.off("message")
        socket.off("user-joined")
      }
    }
  }, [socket])

  const handleCommand = (command: string) => {
    if (!currentUser) return

    if (command.startsWith("/")) {
      handleSystemCommand(command)
    } else if (command.startsWith("figlet ")) {
      // Message starts with "figlet" - send to main chat
      const actualMessage = command.substring(7) // Remove "figlet " prefix
      const message: Message = {
        id: Date.now().toString(),
        content: actualMessage,
        sender: currentUser.username,
        timestamp: new Date(),
        isAscii: false,
      }

      setMessages((prev) => [...prev, message])

      if (socket) {
        socket.emit("message", message)
      }
    } else {
      // Regular message without "figlet" - save to drafts
      setDraftMessages((prev) => [...prev, command])
      addSystemMessage(`Message saved to drafts: "${command}"`)
    }
  }

  const handleSystemCommand = (command: string) => {
    const [cmd, ...args] = command.slice(1).split(" ")

    switch (cmd) {
      case "d":
        // Toggle draft view
        if (currentView === "draft") {
          setCurrentView("chat")
          addSystemMessage("Switched to chat view")
        } else {
          setCurrentView("draft")
          addSystemMessage("Switched to draft messages")
        }
        break
      case "c":
        if (args[0]) {
          // Switch to friend's chat
          setCurrentRoom(args[0])
          setCurrentView("chat")
          addSystemMessage(`Opened chat with ${args[0]}`)
          // In a real app, you'd load the friend's chat history here
        } else {
          addSystemMessage("Usage: /c [friend_name]")
        }
        break
      case "figlet":
        if (args.length > 0) {
          const message: Message = {
            id: Date.now().toString(),
            content: args.join(" "),
            sender: currentUser!.username,
            timestamp: new Date(),
            isAscii: true,
          }
          setMessages((prev) => [...prev, message])
          if (socket) {
            socket.emit("message", message)
          }
        } else {
          addSystemMessage("Usage: /figlet [your message]")
        }
        break
      case "themes":
        const themeList = Object.keys(themes).join(", ")
        addSystemMessage(`Available themes: ${themeList}`)
        break
      case "theme":
        if (args[0] && args[0] in themes) {
          setCurrentTheme(args[0] as keyof typeof themes)
          addSystemMessage(`Theme changed to ${args[0]}`)
        } else {
          addSystemMessage("Invalid theme. Use /themes to see available options.")
        }
        break
      case "join":
        if (args[0]) {
          setCurrentRoom(args[0])
          addSystemMessage(`Joined room: ${args[0]}`)
        }
        break
      case "draft":
        setCurrentView("draft")
        addSystemMessage("Switched to draft view")
        break
      case "chat":
        setCurrentView("chat")
        addSystemMessage("Switched to chat view")
        break
      case "meow":
        // Trigger playground animation
        window.dispatchEvent(new CustomEvent("playgroundCommand", { detail: { command: "cat" } }))
        addSystemMessage("Meow! ASCII cat appeared in playground")
        break
      case "nyan":
        window.dispatchEvent(new CustomEvent("playgroundCommand", { detail: { command: "nyan" } }))
        addSystemMessage("Nyan cat is flying in the playground!")
        break
      case "fire":
        window.dispatchEvent(new CustomEvent("playgroundCommand", { detail: { command: "fire" } }))
        addSystemMessage("Fire is burning in the playground!")
        break
      case "train":
        window.dispatchEvent(new CustomEvent("playgroundCommand", { detail: { command: "train" } }))
        addSystemMessage("Choo choo! Train is moving in playground")
        break
      case "help":
        addSystemMessage(`Available commands:
figlet [text] - Send message to chat (prefix required)
/d - Toggle between chat and draft view
/c [friend] - Open friend's chat
/meow - Show ASCII cat in playground
/nyan - Nyan cat animation in playground
/fire - Fire animation in playground
/train - Train animation in playground
/themes - List available themes
/theme [name] - Change terminal theme
/join [room] - Join chat room
/help - Show this help

Note: Messages without 'figlet' prefix are saved to drafts`)
        break
      default:
        addSystemMessage(`Unknown command: ${cmd}. Type /help for available commands.`)
    }
  }

  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: "system",
      timestamp: new Date(),
      isAscii: false,
    }
    setMessages((prev) => [...prev, message])
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-mono flex`}>
      <div className="flex-1 flex">
        <ChatSidebar
          messages={currentView === "chat" ? messages : []}
          draftMessages={currentView === "draft" ? draftMessages : []}
          currentView={currentView}
          currentRoom={currentRoom}
          theme={theme}
          isConnected={isConnected}
        />

        <div className="flex-1 flex flex-col">
          <div className="border-l border-gray-600 flex-1">
            <div className={`p-4 border-b border-gray-600 ${theme.accent}`}>
              {currentUser?.username}@system [{currentRoom}]
              <span className="float-right">
                {isConnected ? "●" : "○"} {isConnected ? "connected" : "disconnected"}
              </span>
            </div>

            <Playground theme={theme} />
          </div>

          <CommandInput onCommand={handleCommand} currentUser={currentUser} theme={theme} />
        </div>
      </div>
    </div>
  )
}
