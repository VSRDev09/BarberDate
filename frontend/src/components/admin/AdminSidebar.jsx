import {
  CalendarRange,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BrandMark } from '../shared/BrandMark.jsx'

const navItems = [
  { to: '/admin/painel', label: 'Painel Admin', icon: LayoutDashboard },
  { to: '/agendamentos/semana-atual', label: 'Agendamentos da semana', icon: CalendarClock },
  { to: '/admin/agenda', label: 'Agenda Semanal', icon: CalendarRange },
  { to: '/admin/pdf-preview', label: 'PDF Preview', icon: FileText },
]

export function AdminSidebar({ adminName, onLogout }) {
  return (
    <aside className="surface-card flex h-full flex-col rounded-[32px] p-5 sm:p-6">
      <BrandMark />

      <div className="mt-8 rounded-[26px] border border-amber-300/12 bg-amber-300/8 px-4 py-4">
        <p className="section-kicker">Acesso Barbeiro</p>
        <p className="mt-2 text-lg font-semibold text-[#f7ebc6]">{adminName}</p>
        <p className="mt-1 text-sm text-white/55">
          Controle total da agenda da semana.
        </p>
      </div>

      <nav className="mt-8 flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-amber-300/35 bg-amber-300/12 text-[#f7ebc7]'
                    : 'border-white/8 bg-white/[0.02] text-white/60 hover:border-amber-300/20 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="premium-button premium-button-secondary mt-auto w-full"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </aside>
  )
}
