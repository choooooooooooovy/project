import { supabase } from '../lib/supabase'

// 添加评论
export async function addComment(commentData) {
  const { data, error } = await supabase
    .from('comments')
    .insert([commentData])
    .select(`
      *,
      users (username, avatar_url)
    `)
    .single()
  
  if (error) throw error
  return data
}

// 获取菜谱的所有评论
export async function getCommentsByRecipeId(recipeId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users (username, avatar_url)
    `)
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// 删除评论
export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  
  if (error) throw error
}
