"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ARTimer } from "@/components/ar-timer"
import { ARIngredientOverlay } from "@/components/ar-ingredient-overlay"
import { ARGuidancePanel } from "@/components/ar-guidance-panel"
import { Camera, CameraOff, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react"
import type { Recipe } from "@/lib/recipe-data"

interface ARCookingViewProps {
  recipe: Recipe
  currentStep: number
  onStepChange: (step: number) => void
  onExit: () => void
}

export function ARCookingView({ recipe, currentStep, onStepChange, onExit }: ARCookingViewProps) {
  const [cameraActive, setCameraActive] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showIngredients, setShowIngredients] = useState(true)

  const currentStepText = recipe.steps[currentStep]
  const isLastStep = currentStep === recipe.steps.length - 1

  const extractTime = (step: string): { duration: number; label: string } | null => {
    const timeMatch = step.match(/(\d+)[-\s]?(\d+)?\s*(minute|min|second|sec)/i)
    if (timeMatch) {
      const duration = Number.parseInt(timeMatch[1])
      const unit = timeMatch[3].toLowerCase()
      const seconds = unit.startsWith("min") ? duration * 60 : duration
      return { duration: seconds, label: `Step ${currentStep + 1} Timer` }
    }
    return null
  }

  const timerInfo = extractTime(currentStepText)

  const nextStep = () => {
    if (!isLastStep) {
      onStepChange(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* AR Camera View Simulation */}
      <div className="relative h-full w-full bg-gradient-to-br from-muted/50 to-muted">
        {/* Simulated camera feed */}
        <div className="absolute inset-0 flex items-center justify-center">
          {cameraActive ? (
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">AR Camera Active</p>
              <p className="text-sm text-muted-foreground">Point at your cooking workspace</p>
            </div>
          ) : (
            <div className="text-center">
              <CameraOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Camera Paused</p>
            </div>
          )}
        </div>

        {/* AR Overlays */}
        <div className="absolute inset-0 p-4 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="secondary" onClick={onExit}>
              Exit AR
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => setCameraActive(!cameraActive)}>
                {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              </Button>
              <Button variant="secondary" size="icon" onClick={() => setVoiceEnabled(!voiceEnabled)}>
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Section - Ingredients */}
            {showIngredients && (
              <div className="max-w-md">
                <ARIngredientOverlay ingredients={recipe.ingredients} currentStep={currentStep} />
              </div>
            )}

            <div className="space-y-4">
              {/* Current Step Card */}
              <Card className="bg-card/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {currentStep + 1} of {recipe.steps.length}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={previousStep} disabled={currentStep === 0}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextStep} disabled={isLastStep}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed mb-4">{currentStepText}</p>
                  {!isLastStep && (
                    <Button onClick={nextStep} className="w-full">
                      Continue to Next Step
                    </Button>
                  )}
                  {isLastStep && (
                    <Button onClick={onExit} variant="default" className="w-full">
                      Complete Recipe
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Timer if applicable */}
              {timerInfo && (
                <div className="max-w-md">
                  <ARTimer duration={timerInfo.duration} label={timerInfo.label} />
                </div>
              )}

              {/* AR Guidance */}
              <div className="max-w-md">
                <ARGuidancePanel step={currentStepText} stepIndex={currentStep} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
