import { supabase } from '../lib/supabase'

// 添加收藏
export async function addFavorite(userId, recipeId) {
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, recipe_id: recipeId }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 取消收藏
export async function removeFavorite(userId, recipeId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
  
  if (error) throw error
}

// 检查是否已收藏
export async function isFavorited(userId, recipeId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single()
  
  return !error && data !== null
}

// 获取用户的所有收藏
export async function getUserFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      recipes (
        *,
        users (username, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
