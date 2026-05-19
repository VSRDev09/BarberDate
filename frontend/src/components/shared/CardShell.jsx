export function CardShell({ children, className = '' }) {
  return <div className={`surface-card rounded-[28px] p-6 sm:p-7 ${className}`}>{children}</div>
}
