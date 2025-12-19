"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  recipeId: string
  userId?: string
  variant?: "default" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FavoriteButton({ recipeId, userId, variant = "ghost", size = "icon" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      checkFavorite()
    }
  }, [userId, recipeId])

  const checkFavorite = async () => {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .single()

    setIsFavorite(!!data)
  }

  const toggleFavorite = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorite) {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("recipe_id", recipeId)
        setIsFavorite(false)
      } else {
        await supabase.from("favorites").insert({
          user_id: userId,
          recipe_id: recipeId,
        })
        setIsFavorite(true)
      }
      router.refresh()
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={toggleFavorite} disabled={isLoading}>
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  )
}
