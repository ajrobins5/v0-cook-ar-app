import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { ShoppingListContent } from "@/components/shopping-list-content"

export default async function ShoppingListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: shoppingLists } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const defaultList = shoppingLists?.[0]

  const { data: items } = defaultList
    ? await supabase.from("shopping_list_items").select("*").eq("list_id", defaultList.id).order("created_at")
    : { data: [] }

  return (
    <div className="min-h-screen">
      <Header />
      <ShoppingListContent listId={defaultList?.id} initialItems={items || []} userId={user.id} />
    </div>
  )
}
