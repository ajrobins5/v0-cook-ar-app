"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ShoppingListItem {
  id: string
  ingredient: string
  quantity: string | null
  checked: boolean
}

interface ShoppingListContentProps {
  listId?: string
  initialItems: ShoppingListItem[]
  userId: string
}

export function ShoppingListContent({ listId, initialItems, userId }: ShoppingListContentProps) {
  const [items, setItems] = useState<ShoppingListItem[]>(initialItems)
  const [newIngredient, setNewIngredient] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const addItem = async () => {
    if (!newIngredient.trim() || !listId) return

    setIsAdding(true)
    try {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .insert({
          list_id: listId,
          ingredient: newIngredient,
          quantity: newQuantity || null,
          checked: false,
        })
        .select()
        .single()

      if (error) throw error

      setItems([...items, data])
      setNewIngredient("")
      setNewQuantity("")
      router.refresh()
    } catch (error) {
      console.error("Error adding item:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const toggleItem = async (itemId: string, checked: boolean) => {
    try {
      await supabase.from("shopping_list_items").update({ checked }).eq("id", itemId)

      setItems(items.map((item) => (item.id === itemId ? { ...item, checked } : item)))
      router.refresh()
    } catch (error) {
      console.error("Error toggling item:", error)
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      await supabase.from("shopping_list_items").delete().eq("id", itemId)

      setItems(items.filter((item) => item.id !== itemId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const uncheckedItems = items.filter((item) => !item.checked)
  const checkedItems = items.filter((item) => item.checked)

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Shopping List</h1>
        </div>
        <p className="text-muted-foreground">Keep track of ingredients you need</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ingredient name"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="flex-1"
            />
            <Input
              placeholder="Quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="w-32"
            />
            <Button onClick={addItem} disabled={isAdding || !newIngredient.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {uncheckedItems.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>To Buy ({uncheckedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uncheckedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Checkbox checked={item.checked} onCheckedChange={(checked) => toggleItem(item.id, !!checked)} />
                  <div className="flex-1">
                    <p className="font-medium">{item.ingredient}</p>
                    {item.quantity && <p className="text-sm text-muted-foreground">{item.quantity}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {checkedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purchased ({checkedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <Checkbox checked={item.checked} onCheckedChange={(checked) => toggleItem(item.id, !!checked)} />
                  <div className="flex-1">
                    <p className="font-medium line-through text-muted-foreground">{item.ingredient}</p>
                    {item.quantity && <p className="text-sm text-muted-foreground">{item.quantity}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Your shopping list is empty</h2>
          <p className="text-muted-foreground">Add ingredients above to start building your list</p>
        </div>
      )}
    </main>
  )
}
