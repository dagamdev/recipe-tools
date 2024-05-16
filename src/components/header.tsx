import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import HomeIcon from '@/icons/home'

export default function Header () {
  return (
    <header className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto sticky top-0 bg-background rounded-lg">
      <Link className='inline-flex items-center text-lg font-bold text-primary underline-offset-4 hover:underline' href="/">
        <HomeIcon /><span className='sm:inline hidden ml-1'>Home</span>
      </Link>
      <ModeToggle />
    </header>
  )
}
