import { CalendarClock, Check, Clock3, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CardShell } from "../../components/shared/CardShell.jsx";
import { ConfirmModal } from "../../components/shared/ConfirmModal.jsx";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner.jsx";
import { Navbar } from "../../components/shared/Navbar.jsx";
import { SectionTitle } from "../../components/shared/SectionTitle.jsx";
import { WeeklyCalendar } from "../../components/shared/WeeklyCalendar.jsx";
import { useClientSession } from "../../contexts/ClientSessionContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";
import { api } from "../../lib/api.js";
import {
  formatCurrency,
  formatLongDate,
  formatTime,
} from "../../utils/formatters.js";
import { extractApiErrorMessage } from "../../utils/http.js";

export function ClientBookingPage() {
  const { clientProfile, saveClientProfile, hasClientProfile } =
    useClientSession();
  const [form, setForm] = useState(clientProfile);
  const [agenda, setAgenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  const selectedService = useMemo(
    () =>
      agenda?.services?.find(
        (service) => String(service.id) === selectedServiceId,
      ) ?? null,
    [agenda?.services, selectedServiceId],
  );

  const loadAgenda = async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/client/agenda");
      setAgenda(data);
      if (!selectedServiceId && data.services?.[0]) {
        setSelectedServiceId(String(data.services[0].id));
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Falha ao carregar agenda",
        description: extractApiErrorMessage(
          error,
          "Não foi possível carregar a agenda do cliente.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda();
  }, []);

  const handleSlotSelection = (day, slot) => {
    setSelectedSlot({ day, slot });
  };

  const handleOpenConfirmation = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      showToast({
        type: "info",
        title: "Identificação necessária",
        description:
          "Preencha nome e telefone antes de confirmar o agendamento.",
      });
      return;
    }

    if (!selectedServiceId) {
      showToast({
        type: "info",
        title: "Escolha um serviço",
        description: "Selecione o serviço que deseja reservar.",
      });
      return;
    }

    if (!selectedSlot) {
      showToast({
        type: "info",
        title: "Escolha um horário",
        description: "Selecione um horário disponível na agenda semanal.",
      });
      return;
    }

    saveClientProfile(form);
    setConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedServiceId) {
      return;
    }

    setBooking(true);

    try {
      await api.post("/client/appointments", {
        name: form.name,
        phone: form.phone,
        serviceId: Number(selectedServiceId),
        slotId: selectedSlot.slot.id,
      });

      saveClientProfile(form);
      setConfirmOpen(false);
      setSelectedSlot(null);
      showToast({
        type: "success",
        title: "Agendamento confirmado",
        description:
          "O horário foi reservado com sucesso e saiu da lista disponível.",
      });
      await loadAgenda();
    } catch (error) {
      showToast({
        type: "error",
        title: "Falha ao agendar",
        description: extractApiErrorMessage(
          error,
          "Não foi possível concluir o agendamento.",
        ),
      });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="page-shell page-grid">
      <div className="glow-orb top" />
      <div className="glow-orb bottom" />

      <Navbar
        actions={
          <>
            <Link to="/" className="premium-button premium-button-secondary">
              Início
            </Link>
            <Link
              to="/cliente/historico"
              className="premium-button premium-button-primary"
            >
              Meus agendamentos
            </Link>
          </>
        }
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <CardShell className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <SectionTitle
              eyebrow="Entrar como Cliente"
              title="Reserve seu horário na Barber Date sem criar conta."
              description="Basta informar nome e telefone, escolher um serviço e confirmar um horário da semana que esteja liberado pelo barbeiro."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/8 bg-black/35 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#f6e8c3]">
                    Sem cadastro tradicional
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/58">
                  Seus dados são usados apenas para registrar e localizar o
                  agendamento.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/8 bg-black/35 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#f6e8c3]">
                    Confirmação em tempo real
                  </p>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/58">
                  Horários ocupados aparecem para todos e saem da agenda assim
                  que confirmados.
                </p>
              </div>
            </div>
          </div>
        </CardShell>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <CardShell>
            <p className="section-kicker">Identificação</p>
            <h2 className="font-display text-4xl text-[#f8efcf]">
              Quem vai reservar?
            </h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                  Nome
                </label>
                <input
                  className="input-shell"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                  Telefone
                </label>
                <input
                  className="input-shell"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                  Serviço
                </label>
                <select
                  className="input-shell bg-[#111111] text-[#f8efcf]"
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                >
                  {(agenda?.services ?? []).map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                      className="bg-[#111111] text-[#f8efcf]"
                    >
                      {service.name} - {formatCurrency(service.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedService ? (
              <div className="mt-5 rounded-[26px] border border-amber-300/18 bg-amber-300/8 px-5 py-5">
                <p className="section-kicker">Serviço selecionado</p>
                <p className="mt-2 text-lg font-semibold text-[#f8efcf]">
                  {selectedService.name}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/55">Valor</span>
                  <span className="font-semibold text-[#f6e8c3]">
                    {formatCurrency(selectedService.price)}
                  </span>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleOpenConfirmation}
              className="premium-button premium-button-primary mt-6 w-full"
              disabled={!agenda?.released || !agenda?.days?.length}
            >
              <Check className="h-4 w-4" />
              Confirmar horário selecionado
            </button>

            {hasClientProfile ? (
              <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/60">
                Seu último acesso foi salvo para facilitar o histórico e
                eventuais cancelamentos.
              </div>
            ) : null}
          </CardShell>

          <CardShell className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Agenda semanal</p>
                <h2 className="font-display text-4xl text-[#f8efcf]">
                  Horários disponíveis
                </h2>
                {agenda ? (
                  <p className="mt-3 text-sm leading-7 text-white/58">
                    Semana de {formatLongDate(agenda.weekStart)} até{" "}
                    {formatLongDate(agenda.weekEnd)}.
                  </p>
                ) : null}
              </div>

              {selectedSlot ? (
                <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/8 px-4 py-4 text-sm text-[#f8efcf]">
                  <p className="section-kicker">Horário selecionado</p>
                  <p className="mt-2 font-semibold">
                    {selectedSlot.day.dayOfWeek} às{" "}
                    {formatTime(selectedSlot.slot.startTime)}
                  </p>
                </div>
              ) : null}
            </div>

            {loading ? (
              <LoadingSpinner label="Carregando horários da semana..." />
            ) : !agenda?.released ? (
              <div className="mt-6 rounded-[30px] border border-dashed border-amber-300/18 bg-amber-300/6 px-6 py-12 text-center">
                <CalendarClock className="mx-auto h-8 w-8 text-amber-300" />
                <p className="mt-4 font-display text-4xl text-[#f8efcf]">
                  Agenda ainda fechada
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/58">
                  {agenda?.message ||
                    "Lista de agendamento não disponibilizada pelo barbeiro"}
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <WeeklyCalendar
                  days={agenda?.days ?? []}
                  selectedSlotId={selectedSlot?.slot?.id}
                  onSelectSlot={handleSlotSelection}
                  disabled={booking}
                />
              </div>
            )}
          </CardShell>
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title="Deseja realmente confirmar esse horário?"
        description="Ao confirmar, o horário será reservado no mesmo instante e deixará de aparecer como disponível para outros clientes."
        confirmLabel="Confirmar agendamento"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmBooking}
        loading={booking}
      >
        {selectedSlot && selectedService ? (
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/70">
            <p>
              <span className="text-white/45">Cliente:</span> {form.name}
            </p>
            <p className="mt-2">
              <span className="text-white/45">Serviço:</span>{" "}
              {selectedService.name}
            </p>
            <p className="mt-2">
              <span className="text-white/45">Data:</span>{" "}
              {formatLongDate(selectedSlot.day.date)}
            </p>
            <p className="mt-2">
              <span className="text-white/45">Horário:</span>{" "}
              {formatTime(selectedSlot.slot.startTime)}
            </p>
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
