import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CardShell } from "../../components/shared/CardShell.jsx";
import { Navbar } from "../../components/shared/Navbar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";
import { api } from "../../lib/api.js";
import { extractApiErrorMessage } from "../../utils/http.js";

export function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired =
    new URLSearchParams(location.search).get("expired") === "true";

  useEffect(() => {
    if (sessionExpired) {
      showToast({
        type: "error",
        title: "Sessão expirada",
        description: "Faça login novamente para continuar.",
      });

      window.history.replaceState({}, document.title, "/barbeiro/login");
    }
  }, [sessionExpired, showToast]);

  const redirectPath = location.state?.from?.pathname || "/admin/painel";

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      showToast({
        type: "success",
        title: "Acesso liberado",
        description: "O painel do barbeiro está pronto para uso.",
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      showToast({
        type: "error",
        title: "Falha no login",
        description: extractApiErrorMessage(
          error,
          "Não foi possível autenticar o barbeiro.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-grid">
      <div className="glow-orb top" />
      <div className="glow-orb bottom" />

      <Navbar
        actions={
          <Link
            to="/cliente/agendamento"
            className="premium-button premium-button-secondary"
          >
            Ir para cliente
          </Link>
        }
      />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-110px)] w-full max-w-7xl items-center px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rise-in">
            <p className="section-kicker">Barber Access</p>
            <h1 className="font-display text-5xl text-[#f8efcf] sm:text-6xl">
              Acesse os horários dos seus clientes
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">
              Controle de agenda, horários da semana, exportação de PDF e visão
              completa dos agendamentos em um ambiente reservado para o
              barbeiro.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-5">
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                <p className="mt-4 text-sm font-semibold text-[#f7ebc4]">
                  Acesso restrito
                </p>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  Apenas barbeiros conseguem abrir o painel da barbearia.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-5">
                <LockKeyhole className="h-5 w-5 text-amber-300" />
                <p className="mt-4 text-sm font-semibold text-[#f7ebc4]">
                  Segurança máxima
                </p>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  Seus dados e a agenda dos seus clientes totalmente protegidos
                  contra acessos não autorizados.
                </p>
              </div>
            </div>
          </div>

          <CardShell className="rise-in gold-ring">
            <p className="section-kicker">Entrar como barbeiro</p>
            <h2 className="font-display text-4xl text-[#f8efcf]">
              Painel administrativo
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Use suas credenciais de administrador
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                  Usuário
                </label>
                <input
                  className="input-shell"
                  type="text"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                  Senha
                </label>
                <input
                  className="input-shell"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>

              <button
                type="submit"
                className="premium-button premium-button-primary mt-4 w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar no painel"}
              </button>
            </form>
          </CardShell>
        </div>
      </main>
    </div>
  );
}
