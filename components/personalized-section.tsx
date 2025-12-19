import { RecipeCard } from "@/components/recipe-card"
import { getPersonalizedRecommendations, getTrendingRecipes, getQuickRecipes } from "@/lib/recommendations"
import { Sparkles, TrendingUp, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PersonalizedSectionProps {
  profile: {
    cooking_level: string | null
    dietary_preferences: string[] | null
  }
  favorites: string[]
  completedRecipes: string[]
  viewedRecipes: string[]
  userId: string
}

export async function PersonalizedSection({
  profile,
  favorites,
  completedRecipes,
  viewedRecipes,
  userId,
}: PersonalizedSectionProps) {
  const recommendations = getPersonalizedRecommendations(
    {
      cookingLevel: profile.cooking_level || undefined,
      dietaryPreferences: profile.dietary_preferences || undefined,
    },
    {
      favorites,
      completedRecipes,
      viewedRecipes,
    },
    6,
  )

  const trending = getTrendingRecipes(6)
  const quick = getQuickRecipes(6)

  return (
    <section className="mb-12">
      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick & Easy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Recommended For You</h2>
            <p className="text-muted-foreground">
              Based on your {profile.cooking_level || "beginner"} level and cooking preferences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} userId={userId} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Trending Now</h2>
            <p className="text-muted-foreground">Popular recipes in the CookAR community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} userId={userId} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quick">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Quick & Easy</h2>
            <p className="text-muted-foreground">Ready in 30 minutes or less</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quick.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} userId={userId} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
