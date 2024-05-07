'use client'

import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreationButton ({ onClick, elementType }: {
  onClick: () => void
  elementType?: string
}) {
  return (
    <Button onClick={onClick}>
      <PlusIcon className="mr-2"/>
      <span className="hidden sm:block transition-all">Create new {elementType}</span>
    </Button>
  )
}
