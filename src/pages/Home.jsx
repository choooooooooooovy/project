import { useState, useEffect } from 'react'
import RecipeCard from '../components/RecipeCard'
import { getRecipes } from '../services/recipeService'
import { getPopularTags } from '../services/tagService'
import '../styles/Home.css'

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [popularTags, setPopularTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['全部', '川菜', '粤菜', '湘菜', '鲁菜', '西餐', '日料', '家常菜', '素食']

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  async function loadData() {
    try {
      setLoading(true)
      const options = selectedCategory && selectedCategory !== '全部' 
        ? { category: selectedCategory } 
        : {}
      
      const [recipesData, tagsData] = await Promise.all([
        getRecipes(options),
        getPopularTags(15)
      ])
      
      setRecipes(recipesData)
      setPopularTags(tagsData)
    } catch (error) {
      console.error('加载数据失败:', error)
      alert('加载数据失败，请检查 Supabase 配置')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1>🍜 发现美食，分享快乐</h1>
          <p>探索来自世界各地的精彩菜谱</p>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="搜索菜谱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary">搜索</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="categories-section">
          <h2>菜系分类</h2>
          <div className="categories">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category || (category === '全部' && !selectedCategory) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category === '全部' ? '' : category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {popularTags.length > 0 && (
          <div className="tags-section">
            <h2>热门标签</h2>
            <div className="tags-cloud">
              {popularTags.map(tag => (
                <span key={tag.name} className="tag">
                  {tag.name} ({tag.count})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="recipes-section">
          <div className="section-header">
            <h2>精选菜谱</h2>
            <span className="recipe-count">共 {filteredRecipes.length} 个菜谱</span>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>加载中...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="empty-state">
              <p>暂无菜谱，快去发布第一个菜谱吧！</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
