import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark.jsx'

export function Navbar({ actions }) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/" aria-label="Voltar para a página inicial">
        <BrandMark compact />
      </Link>
      <div className="flex items-center gap-3">{actions}</div>
    </header>
  )
}
