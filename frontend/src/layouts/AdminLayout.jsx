import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AdminSidebar } from '../components/admin/AdminSidebar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useToast } from '../contexts/ToastContext.jsx'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast({
      type: 'info',
      title: 'Sessão encerrada',
      description: 'O acesso do barbeiro foi finalizado com segurança.',
    })
    navigate('/barbeiro/login')
  }

  return (
    <div className="page-shell page-grid">
      <div className="glow-orb top" />
      <div className="glow-orb bottom" />

      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="hidden w-80 shrink-0 lg:block">
          <AdminSidebar adminName={admin?.name ?? 'Barber'} onLogout={handleLogout} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="surface-card flex items-center justify-between rounded-[28px] px-5 py-4 lg:hidden">
            <div>
              <p className="section-kicker">Barber Date</p>
              <p className="font-display text-2xl text-[#f7ecc7]">Painel do barbeiro</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80"
              aria-label="Abrir menu do painel"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-black/75 px-4 py-5 backdrop-blur-md lg:hidden">
          <div className="mx-auto h-full max-w-sm">
            <AdminSidebar adminName={admin?.name ?? 'Barber'} onLogout={handleLogout} />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="premium-button premium-button-secondary mt-4 w-full"
            >
              Fechar menu
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
