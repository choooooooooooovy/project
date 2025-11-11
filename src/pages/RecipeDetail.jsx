import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipeById, likeRecipe } from '../services/recipeService'
import { addComment } from '../services/commentService'
import '../styles/RecipeDetail.css'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [commentRating, setCommentRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  // 模拟用户ID（实际项目中应该从认证系统获取）
  const currentUserId = 'a5d0ab11-2cdb-4505-abd7-db3383efb14d'
  const currentUsername = '游客'

  useEffect(() => {
    loadRecipe()
  }, [id])

  async function loadRecipe() {
    try {
      setLoading(true)
      const data = await getRecipeById(id)
      setRecipe(data)
    } catch (error) {
      console.error('加载菜谱失败:', error)
      alert('菜谱不存在或已被删除')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleLike() {
    try {
      await likeRecipe(id)
      setRecipe(prev => ({
        ...prev,
        likes_count: (prev.likes_count || 0) + 1
      }))
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  async function handleSubmitComment(e) {
    e.preventDefault()
    
    if (!commentContent.trim()) {
      alert('请输入评论内容')
      return
    }

    try {
      setSubmitting(true)
      const newComment = await addComment({
        recipe_id: id,
        user_id: currentUserId,
        content: commentContent,
        rating: commentRating
      })

      // 添加用户信息到新评论
      const commentWithUser = {
        ...newComment,
        users: {
          username: currentUsername,
          avatar_url: null
        }
      }

      setRecipe(prev => ({
        ...prev,
        comments: [commentWithUser, ...(prev.comments || [])]
      }))

      setCommentContent('')
      setCommentRating(5)
      alert('评论成功！')
    } catch (error) {
      console.error('评论失败:', error)
      alert('评论失败，请重试')
    } finally {
      setSubmitting(false)
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

  if (!recipe) {
    return <div className="container">菜谱不存在</div>
  }

  return (
    <div className="recipe-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>

        <div className="recipe-header">
          <div className="recipe-main-image">
            <img 
              src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} 
              alt={recipe.title}
            />
          </div>

          <div className="recipe-info">
            <h1>{recipe.title}</h1>
            
            <div className="recipe-author">
              <img 
                src={recipe.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + recipe.users?.username} 
                alt={recipe.users?.username}
              />
              <div>
                <p className="author-name">{recipe.users?.username || '匿名用户'}</p>
                <p className="publish-date">
                  发布于 {new Date(recipe.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            <p className="recipe-description">{recipe.description}</p>

            <div className="recipe-details">
              {recipe.cooking_time && (
                <div className="detail-item">
                  <span className="detail-label">⏱️ 烹饪时间</span>
                  <span className="detail-value">{recipe.cooking_time} 分钟</span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="detail-item">
                  <span className="detail-label">📊 难度</span>
                  <span className={`detail-value difficulty-${recipe.difficulty}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              )}
              {recipe.category && (
                <div className="detail-item">
                  <span className="detail-label">🍽️ 菜系</span>
                  <span className="detail-value">{recipe.category}</span>
                </div>
              )}
            </div>

            {recipe.tags && recipe.tags.length > 0 && (
              <div className="recipe-tags">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag.tag_name}</span>
                ))}
              </div>
            )}

            <div className="recipe-actions">
              <button className="btn btn-primary" onClick={handleLike}>
                ❤️ 点赞 ({recipe.likes_count || 0})
              </button>
              <button className="btn btn-secondary">
                ⭐ 收藏
              </button>
              <span className="views">👁️ {recipe.views_count || 0} 次浏览</span>
            </div>
          </div>
        </div>

        <div className="recipe-content">
          <div className="ingredients-section">
            <h2>🥕 食材清单</h2>
            <div className="ingredients-list">
              {recipe.ingredients.split('\n').map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <span className="ingredient-dot">•</span>
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          <div className="steps-section">
            <h2>👨‍🍳 制作步骤</h2>
            <div className="steps-list">
              {recipe.steps.split('\n').map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="comments-section">
          <h2>💬 评论 ({recipe.comments?.length || 0})</h2>

          <form className="comment-form" onSubmit={handleSubmitComment}>
            <div className="rating-input">
              <label>评分：</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${star <= commentRating ? 'active' : ''}`}
                    onClick={() => setCommentRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            
            <textarea
              placeholder="分享你的制作心得..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
            />
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '提交中...' : '发表评论'}
            </button>
          </form>

          <div className="comments-list">
            {recipe.comments && recipe.comments.length > 0 ? (
              recipe.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <img 
                    src={comment.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.users?.username} 
                    alt={comment.users?.username}
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.users?.username || '匿名用户'}</span>
                      <div className="comment-rating">
                        {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                      </div>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">暂无评论，快来发表第一条评论吧！</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
