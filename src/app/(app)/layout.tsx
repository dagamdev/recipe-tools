import { TabBar } from '@/components/tab-bar'
import { requireUserId } from '@/lib/auth'

export default async function AppLayout ({ children }: { children: React.ReactNode }) {
  await requireUserId()

  return (
    <>
      <div className='mx-auto min-h-dvh max-w-xl pb-32'>{children}</div>
      <TabBar />
    </>
  )
}
