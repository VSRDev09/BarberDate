import { CalendarFold, FileDown, Phone, Scissors, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardShell } from "../../components/shared/CardShell.jsx";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner.jsx";
import { SectionTitle } from "../../components/shared/SectionTitle.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";
import { api } from "../../lib/api.js";
import {
  buildPdfRoute,
  formatCurrency,
  formatDayLabel,
  formatLongDate,
  formatPhone,
  formatTime,
} from "../../utils/formatters.js";
import { extractApiErrorMessage } from "../../utils/http.js";

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [appointmentsByDay, setAppointmentsByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        const dashboardResponse = await api.get("/admin/dashboard");
        const appointmentsResponse = await api.get("/admin/appointments/week");

        setDashboard(dashboardResponse.data);
        setAppointmentsByDay(appointmentsResponse.data);
      } catch (error) {
        showToast({
          type: "error",
          title: "Falha ao carregar painel",
          description: extractApiErrorMessage(
            error,
            "Não foi possível carregar os dados do painel.",
          ),
        });

        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [showToast]);

  if (loading) {
    return <LoadingSpinner label="Carregando painel administrativo..." />;
  }

  if (!dashboard) {
    return (
      <CardShell>
        <p className="text-red-400">Dashboard indisponível</p>
      </CardShell>
    );
  }

  const metrics = [
    {
      icon: CalendarFold,
      label: "Agenda liberada",
      value: dashboard?.released ? "Sim" : "Não",
    },
    {
      icon: Users,
      label: "Agendamentos",
      value: dashboard?.totalWeekAppointments ?? 0,
      to: "/agendamentos/semana-atual",
    },
    {
      icon: Phone,
      label: "Atendimentos de hoje",
      value: dashboard?.todayAppointments ?? 0,
    },
    {
      icon: Scissors,
      label: "Horários ainda livres",
      value: dashboard?.availableSlots ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <CardShell>
        <SectionTitle
          eyebrow="Painel Admin"
          title="Visão geral da semana Barber Date"
          description={`Semana de ${formatLongDate(dashboard?.weekStart)} até ${formatLongDate(dashboard?.weekEnd)}.`}
        />
      </CardShell>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const cardContent = (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="flex-1 min-w-0 break-words text-xs uppercase tracking-[0.18em] text-white/35">
                  {metric.label}
                </p>
              </div>
              <p className="mt-5 font-display text-5xl text-[#f8efcf]">
                {metric.value}
              </p>
            </>
          );

          if (metric.to) {
            return (
              <Link key={metric.label} to={metric.to} className="block cursor-pointer">
                <CardShell className="h-full transition hover:-translate-y-0.5 hover:border-amber-300/25">
                  {cardContent}
                </CardShell>
              </Link>
            );
          }

          return <CardShell key={metric.label}>{cardContent}</CardShell>;
        })}
      </div>

      <CardShell>
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Lista de agendamentos</p>
            <h2 className="font-display text-4xl text-[#f8efcf]">
              Separado por dia da semana
            </h2>
          </div>
          <Link
            to={buildPdfRoute(new Date().toISOString().slice(0, 10))}
            className="premium-button premium-button-secondary"
          >
            <FileDown className="h-4 w-4" />
            Abrir PDF do dia
          </Link>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {appointmentsByDay.map((day) => (
            <div
              key={`${day.dayOfWeek}-${day.date}`}
              className="rounded-[26px] border border-white/8 bg-black/30 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
                <div>
                  <p className="text-sm font-semibold text-[#f6e8c3]">
                    {formatDayLabel(day.dayOfWeek, day.date)}
                  </p>
                  <p className="text-sm text-white/45">
                    {formatLongDate(day.date)}
                  </p>
                </div>
                <Link
                  to={buildPdfRoute(day.date)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/55 transition hover:border-amber-300/25 hover:text-[#f7ecc9]"
                >
                  PDF do dia
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {day.appointments.length ? (
                  day.appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#f6e8c3]">
                          {appointment.clientName}
                        </p>
                        <span className="rounded-full border border-amber-300/18 bg-amber-300/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                          {formatTime(appointment.appointmentTime)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-white/62 sm:grid-cols-2">
                        <p>Telefone: {formatPhone(appointment.clientPhone)}</p>
                        <p>Serviço: {appointment.serviceName}</p>
                        <p className="sm:col-span-2">
                          Valor: {formatCurrency(appointment.servicePrice)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-white/45">
                    Nenhum agendamento confirmado neste dia.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}
