import { Link } from 'react-router-dom'

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="card recipe-card">
      <div className="recipe-image">
        <img 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
          alt={recipe.title}
        />
        {recipe.difficulty && (
          <span className={`difficulty-badge ${recipe.difficulty}`}>
            {recipe.difficulty}
          </span>
        )}
      </div>
      <div className="recipe-content">
        <h3>{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        
        <div className="recipe-meta">
          <div className="author">
            <img 
              src={recipe.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + recipe.users?.username} 
              alt={recipe.users?.username}
            />
            <span>{recipe.users?.username || '匿名用户'}</span>
          </div>
          
          <div className="recipe-stats">
            {recipe.cooking_time && (
              <span>⏱️ {recipe.cooking_time}分钟</span>
            )}
            <span>❤️ {recipe.likes_count || 0}</span>
            <span>👁️ {recipe.views_count || 0}</span>
          </div>
        </div>
        
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-tags">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">{tag.tag_name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
