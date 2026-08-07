import { Link, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div>
      <nav>
        <Link to="/login">Login</Link>
        {' | '}
        <Link to="/tasks">Görevler</Link>
        {' | '}
        <Link to="/users">Kullanıcılar</Link>
        {' | '}
        <Link to="/departments">Departmanlar</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
