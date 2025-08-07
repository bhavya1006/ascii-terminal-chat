export interface User {
  id: string
  username: string
  isOnline: boolean
}

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  isAscii: boolean
}

export interface Theme {
  bg: string
  text: string
  accent: string
}

export interface Room {
  id: string
  name: string
  users: User[]
}
