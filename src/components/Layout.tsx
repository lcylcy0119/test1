import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: '홈', end: true },
  { to: '/quiz', label: '개념 퀴즈' },
  { to: '/schedule', label: '공정표 실습' },
  { to: '/exam', label: '기출 풀이' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">建</span>
          <div>
            <strong>건축기사 공정교실</strong>
            <p>학생 수준 · 공정표 제작 과정</p>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">건축기사 시공·공정관리 학습용 샘플입니다. 실제 기출 원문을 복제하지 않았습니다.</footer>
    </div>
  )
}
