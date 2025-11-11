import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRecipe } from '../services/recipeService'
import { addTags } from '../services/tagService'
import '../styles/CreateRecipe.css'

export default function CreateRecipe() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  
  // 模拟用户ID（实际项目中应该从认证系统获取）
  const currentUserId = 'demo-user-id'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    cooking_time: '',
    difficulty: '简单',
    category: '家常菜',
    image_url: '',
    tags: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.title.trim() || !formData.description.trim() || 
        !formData.ingredients.trim() || !formData.steps.trim()) {
      alert('请填写所有必填字段')
      return
    }

    try {
      setSubmitting(true)
      
      // 创建菜谱
      const recipeData = {
        user_id: currentUserId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        ingredients: formData.ingredients.trim(),
        steps: formData.steps.trim(),
        cooking_time: formData.cooking_time ? parseInt(formData.cooking_time) : null,
        difficulty: formData.difficulty,
        category: formData.category,
        image_url: formData.image_url.trim() || null
      }
      
      const newRecipe = await createRecipe(recipeData)
      
      // 添加标签
      if (formData.tags.trim()) {
        const tagNames = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        if (tagNames.length > 0) {
          await addTags(newRecipe.id, tagNames)
        }
      }
      
      alert('菜谱发布成功！')
      navigate(`/recipe/${newRecipe.id}`)
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试。错误: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-recipe-page">
      <div className="container">
        <div className="page-header">
          <h1>📝 发布新菜谱</h1>
          <p>分享你的拿手好菜，让更多人学会美食的制作</p>
        </div>

        <form className="recipe-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>基本信息</h2>
            
            <div className="form-group">
              <label>菜谱名称 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="例如：宫保鸡丁"
                required
              />
            </div>

            <div className="form-group">
              <label>菜谱描述 *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="简单介绍一下这道菜的特点..."
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>菜系分类</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="家常菜">家常菜</option>
                  <option value="川菜">川菜</option>
                  <option value="粤菜">粤菜</option>
                  <option value="湘菜">湘菜</option>
                  <option value="鲁菜">鲁菜</option>
                  <option value="西餐">西餐</option>
                  <option value="日料">日料</option>
                  <option value="素食">素食</option>
                </select>
              </div>

              <div className="form-group">
                <label>难度等级</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                  <option value="简单">简单</option>
                  <option value="中等">中等</option>
                  <option value="困难">困难</option>
                </select>
              </div>

              <div className="form-group">
                <label>烹饪时间（分钟）</label>
                <input
                  type="number"
                  name="cooking_time"
                  value={formData.cooking_time}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>菜品图片链接</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <small>留空将使用默认图片，建议使用 Unsplash 等免费图片网站</small>
            </div>
          </div>

          <div className="form-section">
            <h2>食材清单 *</h2>
            <div className="form-group">
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="每行一个食材，例如：&#10;鸡胸肉 300g&#10;花生米 100g&#10;干辣椒 10个"
                rows={8}
                required
              />
              <small>每行输入一个食材及用量</small>
            </div>
          </div>

          <div className="form-section">
            <h2>制作步骤 *</h2>
            <div className="form-group">
              <textarea
                name="steps"
                value={formData.steps}
                onChange={handleChange}
                placeholder="每行一个步骤，例如：&#10;1. 鸡肉切丁，用料酒和淀粉腌制15分钟&#10;2. 热油炒花生米至金黄，捞出备用&#10;3. 锅中留底油，爆香葱姜蒜"
                rows={10}
                required
              />
              <small>每行输入一个步骤，尽量详细描述</small>
            </div>
          </div>

          <div className="form-section">
            <h2>标签</h2>
            <div className="form-group">
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="快手菜, 下饭菜, 宴客菜"
              />
              <small>用逗号分隔多个标签，帮助其他人更好地找到你的菜谱</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate(-1)}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '发布中...' : '发布菜谱'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
