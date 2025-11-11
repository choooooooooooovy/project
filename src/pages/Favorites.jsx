import { useState, useEffect } from 'react'
import RecipeCard from '../components/RecipeCard'
import { getUserFavorites, removeFavorite } from '../services/favoriteService'
import '../styles/Favorites.css'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 模拟用户ID（实际项目中应该从认证系统获取）
  const currentUserId = 'demo-user-id'

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    try {
      setLoading(true)
      const data = await getUserFavorites(currentUserId)
      setFavorites(data)
    } catch (error) {
      console.error('加载收藏失败:', error)
      // 如果是因为没有收藏记录导致的错误，不需要显示错误信息
      if (error.code !== 'PGRST116') {
        alert('加载收藏失败，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveFavorite(recipeId) {
    if (!confirm('确定要取消收藏吗？')) {
      return
    }

    try {
      await removeFavorite(currentUserId, recipeId)
      setFavorites(prev => prev.filter(fav => fav.recipe_id !== recipeId))
      alert('已取消收藏')
    } catch (error) {
      console.error('取消收藏失败:', error)
      alert('操作失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="page-header">
          <h1>⭐ 我的收藏</h1>
          <p>你收藏的所有美味菜谱</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>还没有收藏任何菜谱</h2>
            <p>浏览首页，发现更多美食，点击收藏按钮保存喜欢的菜谱</p>
            <a href="/" className="btn btn-primary">去首页逛逛</a>
          </div>
        ) : (
          <div className="favorites-stats">
            <div className="stat-card">
              <div className="stat-number">{favorites.length}</div>
              <div className="stat-label">收藏菜谱</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {new Set(favorites.map(f => f.recipes?.category)).size}
              </div>
              <div className="stat-label">菜系类别</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Math.round(favorites.reduce((sum, f) => sum + (f.recipes?.cooking_time || 0), 0) / favorites.length) || 0}
              </div>
              <div className="stat-label">平均时长(分钟)</div>
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="favorites-grid">
            {favorites.map(favorite => (
              <div key={favorite.id} className="favorite-item">
                <RecipeCard recipe={favorite.recipes} />
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveFavorite(favorite.recipe_id)}
                  title="取消收藏"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
