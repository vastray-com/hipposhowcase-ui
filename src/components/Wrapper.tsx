import type { FC, ReactNode } from 'react'

export const CenterWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      {children}
    </div>
  )
}
