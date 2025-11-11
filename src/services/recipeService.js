import { supabase } from '../lib/supabase'

// 获取所有菜谱（带分页和排序）
export async function getRecipes(options = {}) {
  const { category, limit = 50, orderBy = 'created_at', ascending = false } = options
  
  let query = supabase
    .from('recipes')
    .select(`
      *,
      users (username, avatar_url),
      tags (tag_name)
    `)
    .order(orderBy, { ascending })
    .limit(limit)
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// 根据ID获取单个菜谱详情
export async function getRecipeById(id) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users (username, avatar_url, bio),
      tags (tag_name),
      comments (
        id,
        content,
        rating,
        created_at,
        users (username, avatar_url)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // 增加浏览次数
  await supabase
    .from('recipes')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', id)
  
  return data
}

// 创建新菜谱
export async function createRecipe(recipeData) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipeData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 搜索菜谱
export async function searchRecipes(keyword) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users (username, avatar_url)
    `)
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// 点赞菜谱
export async function likeRecipe(recipeId) {
  const { data: recipe } = await supabase
    .from('recipes')
    .select('likes_count')
    .eq('id', recipeId)
    .single()
  
  const { error } = await supabase
    .from('recipes')
    .update({ likes_count: (recipe.likes_count || 0) + 1 })
    .eq('id', recipeId)
  
  if (error) throw error
}
