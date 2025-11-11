import { supabase } from '../lib/supabase'

// 为菜谱添加标签
export async function addTags(recipeId, tagNames) {
  const tags = tagNames.map(name => ({
    recipe_id: recipeId,
    tag_name: name.trim()
  }))
  
  const { data, error } = await supabase
    .from('tags')
    .insert(tags)
    .select()
  
  if (error) throw error
  return data
}

// 获取所有热门标签
export async function getPopularTags(limit = 20) {
  const { data, error } = await supabase
    .from('tags')
    .select('tag_name')
  
  if (error) throw error
  
  // 统计标签出现次数
  const tagCount = data.reduce((acc, { tag_name }) => {
    acc[tag_name] = (acc[tag_name] || 0) + 1
    return acc
  }, {})
  
  // 排序并返回前N个
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

// 根据标签搜索菜谱
export async function getRecipesByTag(tagName) {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      recipes (
        *,
        users (username, avatar_url)
      )
    `)
    .eq('tag_name', tagName)
  
  if (error) throw error
  return data.map(item => item.recipes)
}
