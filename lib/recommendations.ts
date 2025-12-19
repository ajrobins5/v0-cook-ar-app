import type { Recipe } from "./recipe-data"
import { recipes } from "./recipe-data"

interface UserPreferences {
  cookingLevel?: string
  dietaryPreferences?: string[]
}

interface UserActivity {
  favorites: string[]
  completedRecipes: string[]
  viewedRecipes: string[]
}

export function getPersonalizedRecommendations(
  preferences: UserPreferences,
  activity: UserActivity,
  limit = 6,
): Recipe[] {
  const scores = recipes.map((recipe) => {
    let score = 0

    // Boost score if recipe matches user's cooking level
    if (preferences.cookingLevel) {
      if (recipe.difficulty.toLowerCase() === preferences.cookingLevel.toLowerCase()) {
        score += 3
      }
    }

    // Penalty for already completed recipes
    if (activity.completedRecipes.includes(recipe.id)) {
      score -= 5
    }

    // Boost score for favorited similar recipes
    const favoritedSimilar = activity.favorites.filter((favId) => {
      const favRecipe = recipes.find((r) => r.id === favId)
      return favRecipe && areSimilar(recipe, favRecipe)
    })
    score += favoritedSimilar.length * 2

    // Boost score for viewed similar recipes
    const viewedSimilar = activity.viewedRecipes.filter((viewId) => {
      const viewRecipe = recipes.find((r) => r.id === viewId)
      return viewRecipe && areSimilar(recipe, viewRecipe)
    })
    score += viewedSimilar.length * 1

    // Boost shorter recipes for beginners
    if (preferences.cookingLevel === "beginner") {
      const time = Number.parseInt(recipe.time)
      if (time <= 30) score += 2
    }

    // Random factor for diversity
    score += Math.random() * 0.5

    return { recipe, score }
  })

  // Sort by score and return top N
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.recipe)
}

function areSimilar(recipe1: Recipe, recipe2: Recipe): boolean {
  // Check if recipes are similar based on difficulty
  if (recipe1.difficulty === recipe2.difficulty) return true

  // Check if they share common ingredients
  const ingredients1 = recipe1.ingredients.map((i) => i.toLowerCase())
  const ingredients2 = recipe2.ingredients.map((i) => i.toLowerCase())

  const commonIngredients = ingredients1.filter((ing) => ingredients2.some((ing2) => ing2.includes(ing.split(" ")[0])))

  return commonIngredients.length >= 2
}

export function getTrendingRecipes(limit = 6): Recipe[] {
  // For now, return random recipes as "trending"
  // In production, this would be based on actual view/completion data
  return [...recipes].sort(() => Math.random() - 0.5).slice(0, limit)
}

export function getQuickRecipes(limit = 6): Recipe[] {
  return recipes
    .filter((recipe) => Number.parseInt(recipe.time) <= 30)
    .sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time))
    .slice(0, limit)
}
