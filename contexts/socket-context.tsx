"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Socket } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // For demo purposes, we'll simulate a socket connection
    // In a real app, you'd connect to your actual socket server
    const mockSocket = {
      on: (event: string, callback: Function) => {
        // Mock event listeners
      },
      off: (event: string, callback?: Function) => {
        // Mock event removal
      },
      emit: (event: string, data: any) => {
        console.log("Mock socket emit:", event, data)
      },
    } as any

    setSocket(mockSocket)
    setIsConnected(true)

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
