'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useFormStore } from '@/store/form-store'
import DinamicForm from './dinamic-form'

export default function FormDialog () {
  const [open, setOpen, action, type] = useFormStore(store => [store.open, store.setOpen, store.action, store.type])
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleWidht = () => {
      if (window.innerWidth >= 720) setIsDesktop(true)
      if (window.innerWidth < 720) setIsDesktop(false)
    }

    if (typeof window === 'undefined') return

    window.addEventListener('resize', handleWidht)

    return () => {
      window.removeEventListener('resize', handleWidht)
    }
  }, [])

  const description = action === 'create'
    ? type === 'product'
      ? 'Create a new product to reference an ingredient in a recipe'
      : 'Once it is created you can add the ingredients'
    : `Make changes to your ${type} here. Click save when you're done.`

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{action === 'create'
              ? `Create ${type}`
              : `Edit ${type}`}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <DinamicForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={'top'}>
        <SheetHeader>
          <SheetTitle>{action === 'create'
            ? `Create ${type}`
            : `Edit ${type}`}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>
        <DinamicForm />
      </SheetContent>
    </Sheet>
  )
}
