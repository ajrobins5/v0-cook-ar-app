"use client"

import { useState, useEffect } from "react"
import { Clock, Users, ChefHat, ArrowLeft, Scan, Check, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ARCookingView } from "@/components/ar-cooking-view"
import { FavoriteButton } from "@/components/favorite-button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Recipe } from "@/lib/recipe-data"

interface RecipeDetailProps {
  recipe: Recipe
  userId?: string
}

export function RecipeDetail({ recipe, userId }: RecipeDetailProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [arMode, setArMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      loadProgress()
      trackView()
    }
  }, [userId])

  const loadProgress = async () => {
    const { data } = await supabase
      .from("recipe_progress")
      .select("current_step, completed_steps")
      .eq("user_id", userId)
      .eq("recipe_id", recipe.id)
      .single()

    if (data) {
      setActiveStep(data.current_step || 0)
      setCompletedSteps(new Set(data.completed_steps || []))
    }
  }

  const trackView = async () => {
    await supabase.from("user_analytics").insert({
      user_id: userId,
      recipe_id: recipe.id,
      action: "view",
    })
  }

  const saveProgress = async (step: number, completed: number[]) => {
    if (!userId) return

    await supabase.from("recipe_progress").upsert({
      user_id: userId,
      recipe_id: recipe.id,
      current_step: step,
      completed_steps: completed,
      last_updated: new Date().toISOString(),
    })
  }

  const toggleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex)
    } else {
      newCompleted.add(stepIndex)
    }
    setCompletedSteps(newCompleted)
    saveProgress(activeStep, Array.from(newCompleted))
  }

  const addToShoppingList = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    try {
      const { data: lists } = await supabase.from("shopping_lists").select("id").eq("user_id", userId).limit(1)

      if (!lists || lists.length === 0) return

      const items = recipe.ingredients.map((ingredient) => ({
        list_id: lists[0].id,
        recipe_id: recipe.id,
        ingredient,
        checked: false,
      }))

      await supabase.from("shopping_list_items").insert(items)

      alert("Ingredients added to shopping list!")
    } catch (error) {
      console.error("Error adding to shopping list:", error)
    }
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step)
    saveProgress(step, Array.from(completedSteps))
  }

  const startCooking = async () => {
    if (userId) {
      await supabase.from("user_analytics").insert({
        user_id: userId,
        recipe_id: recipe.id,
        action: "start",
      })
    }
    setArMode(true)
  }

  if (arMode) {
    return (
      <ARCookingView
        recipe={recipe}
        currentStep={activeStep}
        onStepChange={handleStepChange}
        onExit={() => setArMode(false)}
      />
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="relative h-96 rounded-xl overflow-hidden mb-4">
            <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="w-full h-full object-cover" />
            <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">AR Ready</Badge>
            <div className="absolute top-4 left-4">
              <FavoriteButton recipeId={recipe.id} userId={userId} variant="default" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4 text-balance">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">{recipe.description}</p>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{recipe.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">{recipe.difficulty}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button size="lg" className="flex-1" onClick={startCooking}>
              <Scan className="w-5 h-5 mr-2" />
              Start AR Cooking
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingredients</CardTitle>
            <Button variant="outline" size="sm" onClick={addToShoppingList}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span className="text-sm">{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      activeStep === index
                        ? "border-primary bg-primary/5"
                        : completedSteps.has(index)
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleStepChange(index)}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStepComplete(index)
                        }}
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          completedSteps.has(index)
                            ? "bg-accent border-accent text-accent-foreground"
                            : "border-muted-foreground"
                        }`}
                      >
                        {completedSteps.has(index) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
