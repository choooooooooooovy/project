import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">
          🍜 美食分享
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              首页
            </Link>
          </li>
          <li>
            <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>
              发布菜谱
            </Link>
          </li>
          <li>
            <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>
              我的收藏
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
