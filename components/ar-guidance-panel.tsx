"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ThermometerSun, Scale } from "lucide-react"
import type { JSX } from "react" // Declare JSX variable

interface ARGuidancePanelProps {
  step: string
  stepIndex: number
}

export function ARGuidancePanel({ step, stepIndex }: ARGuidancePanelProps) {
  const getGuidance = (step: string) => {
    const guidance: { icon: JSX.Element; tip: string }[] = []

    if (step.toLowerCase().includes("heat") || step.toLowerCase().includes("cook")) {
      guidance.push({
        icon: <ThermometerSun className="w-4 h-4" />,
        tip: "Medium heat: Bubbles should gently break the surface",
      })
    }

    if (step.toLowerCase().includes("mix") || step.toLowerCase().includes("stir")) {
      guidance.push({
        icon: <Lightbulb className="w-4 h-4" />,
        tip: "Mix until just combined - overmixing can make it tough",
      })
    }

    if (step.toLowerCase().includes("measure") || step.toLowerCase().includes("cup")) {
      guidance.push({
        icon: <Scale className="w-4 h-4" />,
        tip: "Level dry ingredients with a knife for accuracy",
      })
    }

    if (
      step.toLowerCase().includes("season") ||
      step.toLowerCase().includes("salt") ||
      step.toLowerCase().includes("pepper")
    ) {
      guidance.push({
        icon: <Lightbulb className="w-4 h-4" />,
        tip: "Taste as you go - you can always add more seasoning",
      })
    }

    return guidance
  }

  const guidanceItems = getGuidance(step)

  if (guidanceItems.length === 0) return null

  return (
    <Card className="bg-accent/10 border-accent">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="border-accent text-accent">
            AR Tips
          </Badge>
          <span className="text-sm font-medium">Cooking Guidance</span>
        </div>
        <div className="space-y-2">
          {guidanceItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded bg-card">
              <div className="text-accent mt-0.5">{item.icon}</div>
              <p className="text-sm text-muted-foreground">{item.tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
