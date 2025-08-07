"use client"

import { useState, useEffect, useRef } from "react"
import type { Theme } from "@/types"
import { generateNyanCat, generateFire, generateTrain, generateCat } from "@/utils/ascii-animations"

interface PlaygroundProps {
  theme: Theme
}

export default function Playground({ theme }: PlaygroundProps) {
  const [currentAnimation, setCurrentAnimation] = useState<string>("")
  const [animationType, setAnimationType] = useState<string>("")
  const animationRef = useRef<NodeJS.Timeout>()
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Start with a welcome ASCII art
    setCurrentAnimation(generateCat())
    setAnimationType("cat")

    // Auto-cycle animations every 2 minutes
    const interval = setInterval(() => {
      const animations = ["nyan", "fire", "train", "cat"]
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
      startAnimation(randomAnimation)
    }, 120000) // 2 minutes

    return () => {
      clearInterval(interval)
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [])

  const startAnimation = (type: string) => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }

    setAnimationType(type)

    switch (type) {
      case "nyan":
        animateNyanCat()
        break
      case "fire":
        animateFire()
        break
      case "train":
        animateTrain()
        break
      case "cat":
        setCurrentAnimation(generateCat())
        break
      default:
        setCurrentAnimation("Unknown animation")
    }
  }

  const animateNyanCat = () => {
    let frame = 0
    animationRef.current = setInterval(() => {
      setCurrentAnimation(generateNyanCat(frame))
      frame = (frame + 1) % 4
    }, 200)
  }

  const animateFire = () => {
    let frame = 0
    animationRef.current = setInterval(() => {
      setCurrentAnimation(generateFire(frame))
      frame = (frame + 1) % 8
    }, 150)
  }

  const animateTrain = () => {
    let position = 0
    animationRef.current = setInterval(() => {
      setCurrentAnimation(generateTrain(position))
      position = (position + 1) % 50
    }, 100)
  }

  // Listen for global animation commands
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "1":
            startAnimation("nyan")
            break
          case "2":
            startAnimation("fire")
            break
          case "3":
            startAnimation("train")
            break
          case "4":
            startAnimation("cat")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  // Add this useEffect after the existing ones
  useEffect(() => {
    const handlePlaygroundCommand = (event: CustomEvent) => {
      const { command } = event.detail
      startAnimation(command)
    }

    window.addEventListener("playgroundCommand", handlePlaygroundCommand as EventListener)

    return () => {
      window.removeEventListener("playgroundCommand", handlePlaygroundCommand as EventListener)
    }
  }, [])

  return (
    <div className="flex-1 p-4 overflow-hidden">
      <div className={`text-center mb-4 ${theme.accent}`}>
        <div className="text-sm mb-2">Play Area</div>
        <div className="text-xs opacity-60">Current: {animationType} | Ctrl+1-4 for animations</div>
      </div>

      <div ref={canvasRef} className="h-full overflow-auto flex items-center justify-center">
        <pre className="text-xs leading-tight whitespace-pre text-center">{currentAnimation}</pre>
      </div>

      <div className={`absolute bottom-20 right-4 text-xs ${theme.accent} opacity-60`}>
        <div>Animation Controls:</div>
        <div>Ctrl+1: Nyan Cat</div>
        <div>Ctrl+2: Fire</div>
        <div>Ctrl+3: Train</div>
        <div>Ctrl+4: Cat</div>
      </div>
    </div>
  )
}
