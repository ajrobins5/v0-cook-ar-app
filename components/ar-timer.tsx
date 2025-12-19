"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Play, Pause, RotateCcw } from "lucide-react"

interface ARTimerProps {
  duration: number
  label: string
  onComplete?: () => void
}

export function ARTimer({ duration, label, onComplete }: ARTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsComplete(true)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const reset = () => {
    setTimeLeft(duration)
    setIsRunning(false)
    setIsComplete(false)
  }

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <Card className={`${isComplete ? "border-accent animate-pulse" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">{label}</span>
          </div>
          <span className="text-2xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsRunning(!isRunning)} className="flex-1">
            {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
