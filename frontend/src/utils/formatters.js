const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const dateLongFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value ?? 0))
}

export function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T12:00:00`))
}

export function formatLongDate(date) {
  return dateLongFormatter.format(new Date(`${date}T12:00:00`))
}

export function formatDayLabel(dayOfWeek, date) {
  if (date) {
    const label = dayFormatter.format(new Date(`${date}T12:00:00`))
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  return dayOfWeek
}

export function formatTime(value) {
  return (value ?? '').slice(0, 5)
}

export function formatPhone(value) {
  const digits = `${value ?? ''}`.replace(/\D/g, '')

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return value ?? ''
}

export function getStatusLabel(status) {
  return status === 'CANCELLED' ? 'Cancelado' : 'Agendado'
}

export function buildPdfRoute(date) {
  return `/admin/pdf-preview?date=${date}`
}
