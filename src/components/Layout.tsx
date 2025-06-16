import { NavBar } from '@/components/SIderBar.tsx'
import { Outlet } from 'react-router'

export const Layout = () => {
  return (
    <div className="h-full w-full flex p-[16px]">
      <aside className="h-full w-[80px] flex items-center justify-center">
        <NavBar />
      </aside>

      <main className="ml-[16px] h-full w-[calc(100%_-_72px_-_16px)]">
        <Outlet />
      </main>
    </div>
  )
}
