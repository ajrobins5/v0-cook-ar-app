"use client"

import { Clock, Users, Scan } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"
import Link from "next/link"
import type { Recipe } from "@/lib/recipe-data"

interface RecipeCardProps {
  recipe: Recipe
  userId?: string
}

export function RecipeCard({ recipe, userId }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 bg-muted overflow-hidden">
        <Link href={`/recipe/${recipe.id}`}>
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">AR Ready</Badge>
        <div className="absolute top-3 left-3">
          <FavoriteButton recipeId={recipe.id} userId={userId} />
        </div>
      </div>
      <CardContent className="p-4">
        <Link href={`/recipe/${recipe.id}`}>
          <h3 className="font-bold text-lg mb-2 line-clamp-1 hover:text-primary cursor-pointer">{recipe.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{recipe.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        <Button className="w-full bg-transparent" variant="outline" asChild>
          <Link href={`/recipe/${recipe.id}`}>
            <Scan className="w-4 h-4 mr-2" />
            Start AR Tutorial
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
