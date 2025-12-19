"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Camera, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  user_id: string
  rating: number
  comment: string
  photo_url: string | null
  created_at: string
  profiles: {
    display_name: string | null
  }
}

interface RecipeReviewsProps {
  recipeId: string
  userId?: string
  reviews: Review[]
}

export function RecipeReviews({ recipeId, userId, reviews }: RecipeReviewsProps) {
  const [isWritingReview, setIsWritingReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const userReview = reviews.find((r) => r.user_id === userId)
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const submitReview = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      let photoUrl = null

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop()
        const fileName = `${userId}-${recipeId}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("recipe-photos")
          .upload(fileName, photoFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("recipe-photos").getPublicUrl(uploadData.path)

        photoUrl = publicUrl
      }

      // Insert or update review
      const { error } = await supabase.from("recipe_reviews").upsert({
        user_id: userId,
        recipe_id: recipeId,
        rating,
        comment: comment.trim() || null,
        photo_url: photoUrl,
      })

      if (error) throw error

      // Track analytics
      await supabase.from("user_analytics").insert({
        user_id: userId,
        recipe_id: recipeId,
        action: "share",
      })

      setIsWritingReview(false)
      setRating(0)
      setComment("")
      setPhotoFile(null)
      setPhotoPreview(null)
      router.refresh()
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews & Ratings</CardTitle>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(averageRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}
          </div>
          {userId && !userReview && (
            <Button onClick={() => setIsWritingReview(!isWritingReview)}>
              {isWritingReview ? "Cancel" : "Write Review"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Write Review Form */}
        {isWritingReview && (
          <div className="mb-6 p-4 border rounded-lg">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= (hoverRating || rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                placeholder="Share your cooking experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Add Photo (Optional)</label>
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload your dish photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                </label>
              )}
            </div>

            <Button onClick={submitReview} disabled={isSubmitting || rating === 0} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )}

        {/* Display Reviews */}
        <div className="space-y-4">
          {reviews.length === 0 && !isWritingReview && (
            <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
          )}

          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{review.profiles?.display_name || "Anonymous Chef"}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>}
              {review.photo_url && (
                <img
                  src={review.photo_url || "/placeholder.svg"}
                  alt="Review"
                  className="w-48 h-48 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
