import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import HomeIcon from '@/icons/home'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Header () {
  return (
    <header className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto">
      <Link className={cn('text-lg font-bold', buttonVariants({ variant: 'ghost' }))} href="/">
        <HomeIcon /><span className='sm:inline hidden ml-1'>Home</span>
      </Link>

      <ModeToggle />
    </header>
  )
}
