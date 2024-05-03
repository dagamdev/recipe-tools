import Link from 'next/link'
import { ModeToggle } from './mode-toggle'

export default function Header () {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-secondary">
      <Link className="text-lg font-bold" href="/">
        Recipe tools
      </Link>

      <nav className="hidden md:flex items-center space-x-6">
        <Link className="hover:text-gray-400" href="#">
          About
        </Link>
        <Link className="hover:text-gray-400" href="#">
          Services
        </Link>
        <Link className="hover:text-gray-400" href="#">
          Contact
        </Link>
      </nav>

      <ModeToggle />
    </header>
  )
}
