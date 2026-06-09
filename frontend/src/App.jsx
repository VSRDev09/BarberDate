import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/shared/ProtectedRoute.jsx'
import { ToastViewport } from './components/shared/ToastViewport.jsx'
import { AdminLayout } from './layouts/AdminLayout.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx'
import { AdminLoginPage } from './pages/admin/AdminLoginPage.jsx'
import { AdminSchedulePage } from './pages/admin/AdminSchedulePage.jsx'
import { AdminWeeklyAppointmentsPage } from './pages/admin/AdminWeeklyAppointmentsPage.jsx'
import { PdfPreviewPage } from './pages/admin/PdfPreviewPage.jsx'
import { ClientBookingPage } from './pages/client/ClientBookingPage.jsx'
import { ClientHistoryPage } from './pages/client/ClientHistoryPage.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cliente/agendamento" element={<ClientBookingPage />} />
        <Route path="/cliente/historico" element={<ClientHistoryPage />} />
        <Route path="/barbeiro/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/painel" replace />} />
          <Route path="painel" element={<AdminDashboardPage />} />
          <Route path="agenda" element={<AdminSchedulePage />} />
          <Route path="pdf-preview" element={<PdfPreviewPage />} />
        </Route>
        <Route
          path="/agendamentos/semana-atual"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminWeeklyAppointmentsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </>
  )
}

export default App
