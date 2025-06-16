import type { FC, ReactNode } from 'react'

type Props = {
  title: string
  extra?: ReactNode
  children: ReactNode
}

export const SectionWrapper: FC<Props> = ({ children, title, extra }) => {
  return (
    <section className="h-full w-full rounded-2 bg-white">
      <h2 className="h-[56px] flex items-center justify-between b-b-1 b-b-[#DCE1EC] b-b-solid px-[12px] text-[18px] text-primary font-500">
        <span>{title}</span>
        <div>{extra}</div>
      </h2>
      <div className="pos-relative h-[calc(100%_-_56px_-_1px)] w-full px-[12px]">
        {children}
      </div>
    </section>
  )
}
