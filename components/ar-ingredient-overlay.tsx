"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2 } from "lucide-react"
import { useState } from "react"

interface ARIngredientOverlayProps {
  ingredients: string[]
  currentStep: number
}

export function ARIngredientOverlay({ ingredients, currentStep }: ARIngredientOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const highlightedIngredients = ingredients.slice(0, Math.min(currentStep + 2, ingredients.length))

  return (
    <Card className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              AR View
            </Badge>
            <span className="text-sm font-medium">Ingredients in Focus</span>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="hover:opacity-80">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {highlightedIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-primary-foreground/10">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm">{ingredient}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
