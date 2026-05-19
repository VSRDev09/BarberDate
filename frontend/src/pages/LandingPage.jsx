import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardShell } from '../components/shared/CardShell.jsx'
import { Navbar } from '../components/shared/Navbar.jsx'
import { SectionTitle } from '../components/shared/SectionTitle.jsx'

const highlights = [
  'Agenda semanal sempre atualizada',
  'Gestão Completa de Serviços',
  'Área Exclusiva do Profissional',
]

const entryCards = [
  {
    title: 'Entrar como Cliente',
    description:
      'Informe nome e telefone, escolha serviço e reserve um horário disponível com confirmação instantânea.',
    to: '/cliente/agendamento',
    icon: CalendarDays,
    buttonLabel: 'Agendar agora',
  },
  {
    title: 'Entrar como Barbeiro',
    description:
      'Acesse o painel administrativo para liberar a agenda, editar horários e baixar PDFs dos atendimentos.',
    to: '/barbeiro/login',
    icon: ShieldCheck,
    buttonLabel: 'Acessar painel',
  },
]

export function LandingPage() {
  return (
    <div className="page-shell page-grid">
      <div className="glow-orb top" />
      <div className="glow-orb bottom" />

      <Navbar
        actions={
          <Link to="/barbeiro/login" className="premium-button premium-button-secondary">
            Painel do barbeiro
          </Link>
        }
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.95fr] lg:items-center">
          <div className="rise-in">
            <SectionTitle
              eyebrow="Barbearia premium"
              title="Seu horário na barbearia, agendado em segundos."
              description="Uma experiência premium do agendamento à cadeira. Rápido, prático e feito para quem vive na correria."
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/cliente/agendamento" className="premium-button premium-button-primary">
                Reservar horário
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/barbeiro/login" className="premium-button premium-button-secondary">
                Entrar como barbeiro
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/65"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <CardShell className="rise-in relative overflow-hidden">
            <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-amber-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="section-kicker">Experiência real</p>
                <p className="text-lg font-semibold text-[#f8efcf]">Simples para quem agenda, completo para quem trabalha</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {[
                'Clientes visualizam horários livres e ocupados sem exposição de dados sensíveis.',
                'Barbeiros administram disponibilidade por dia da semana e liberam a agenda quando desejarem.',
                'Agendamentos saem da lista disponível imediatamente e podem ser cancelados a qualquer momento.',
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-3xl border border-white/8 bg-black/35 px-4 py-4 text-sm leading-7 text-white/62"
                >
                  <span className="font-display text-3xl text-amber-300/75">0{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardShell>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {entryCards.map((card) => {
            const Icon = card.icon

            return (
              <CardShell key={card.title} className="rise-in group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300/6 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="section-kicker">Acesso principal</p>
                  </div>
                  <h3 className="mt-5 font-display text-4xl text-[#f8efcf]">{card.title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">{card.description}</p>

                  <Link to={card.to} className="premium-button premium-button-secondary mt-8 w-full sm:w-fit">
                    {card.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardShell>
            )
          })}
        </section>
      </main>
    </div>
  )
}
