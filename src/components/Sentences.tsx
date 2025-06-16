import type { FC } from 'react'
import { formatTimestamp } from '@/utils/timeHelper.ts'
import clsx from 'clsx'
import { useEffect, useMemo, useRef } from 'react'

type DisplayMessage = {
  role: string
  content: string
  timestamp: number
}
type DisplayMessages = DisplayMessage[]

type Props = {
  classNames?: string
  sentences: Note.Sentences
}

export const Sentences: FC<Props> = ({ classNames, sentences }) => {
  const messages = useMemo<DisplayMessages>(() => sentences.map(sentence => ({
    role: sentence.role_id,
    content: sentence.content,
    timestamp: sentence.begin_time,
  })), [sentences])

  // 转写自动滚动
  const scrollWrapper = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (scrollWrapper.current) {
      scrollWrapper.current.scrollTop = scrollWrapper.current.scrollHeight
    }
  }, [messages])

  // 角色颜色
  const getRoleColor = (role: string) => {
    switch (role) {
      case '医生':
        return '#FFA400'
      default:
        return '#009FFD'
    }
  }

  return (
    <div ref={scrollWrapper} className={clsx(classNames, 'overflow-auto')}>
      <ul className="flex flex-col justify-center gap-y-[12px] py-[12px]">
        {
          messages.map(msg => (
            msg.content && (
              <li key={msg.timestamp}>
                <div
                  className="flex items-center gap-x-[8px] text-[14px] font-medium"
                  style={{ color: getRoleColor(msg.role) }}
                >
                  <span>{msg.role}</span>
                  <span>{formatTimestamp(msg.timestamp)}</span>
                </div>
                <p className="text-[14px] text-primary">{msg.content}</p>
              </li>
            )
          ))
        }
      </ul>
    </div>
  )
}
