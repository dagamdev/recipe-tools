'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { useToolsStore } from '@/store/tools-store'
import DinamicForm from './dinamic-form'

export function DrawerDialog () {
  const [open, setOpen, action, type, formData] = useToolsStore(store => [store.open, store.setOpen, store.action, store.type, store.formData])
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.innerWidth >= 720) setIsDesktop(true)
    if (window.innerWidth < 720) setIsDesktop(false)
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
          <DinamicForm type={type} defaultValues={formData} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{action === 'create'
            ? `Create ${type}`
            : `Edit ${type}`}</DrawerTitle>
          <DrawerDescription>
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <DinamicForm type={type} className="px-4" defaultValues={formData} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
