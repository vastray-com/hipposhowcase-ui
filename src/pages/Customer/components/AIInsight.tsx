import type { FC } from 'react'
import { AIInsightContent } from '@/components/AIInsightContent.tsx'
import Orb from '@/components/animation/Orb.tsx'
import { RecorderContext } from '@/components/RecorderProvider/RecorderContext.tsx'
import { SectionWrapper } from '@/pages/Customer/components/SectionWrapper.tsx'
import { CustomerContext } from '@/pages/Customer/CustomerContext.tsx'
import { api } from '@/utils/api.ts'
import { parseAIInsightContent } from '@/utils/helper.ts'
import { useContext, useEffect, useState } from 'react'

type Props = {
  content?: string | null
  isNewRecord: boolean
  recommend?: string | null
  tips?: string[] | null
}
export const AIInsight: FC<Props> = ({ content, isNewRecord, recommend, tips }) => {
  const { isRecording } = useContext(RecorderContext)
  const { currentNoteId } = useContext(CustomerContext)
  const [data, setData] = useState<Note.AIContent | null>(null)

  // 初始化 AI 辅助诊疗内容
  useEffect(() => {
    if (!isNewRecord) {
      setData(parseAIInsightContent({ content, recommend }))
    }
  }, [content, isNewRecord, recommend])

  useEffect(() => {
    let timer = null
    if (isRecording && currentNoteId) {
      timer = setInterval(async () => {
        const res = await api.note.getDetail(currentNoteId)
        if (res.code === 200) {
          if (res.data.content) {
            setData(parseAIInsightContent({ content: res.data.content, recommend: res.data.recommend }))
          }
        }
      }, 5000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [currentNoteId, isRecording])

  return (
    <SectionWrapper title="AI 辅助诊疗" extra={(isNewRecord && isRecording) ? <span className="text-[12px] text-info font-normal">AI 分析中...</span> : null}>
      <div className="h-full overflow-auto">
        {
          tips && tips.length > 0 && (
            <div className="my-[8px] bg-[#F8F3ED4D] p-[12px]">
              <p className="flex items-center text-[#FFB6A3]">
                <i className="i-heroicons-outline:light-bulb text-[18px] text-black2 text-inherit" />
                <span className="ml-[4px] text-[14px] text-info text-inherit font-normal">问诊建议</span>
              </p>
              <ul className="ml-[4px] mt-[8px] flex flex-col gap-y-[8px]">
                {tips.map((tip, index) => (
                  <li key={index} className="text-[14px] text-info font-normal leading-relaxed">{`${index + 1}. ${tip}`}</li>
                ))}
              </ul>
            </div>
          )
        }

        {
          isNewRecord && !isRecording && <Orb />
        }
        {
          isNewRecord && isRecording && !data && <Orb forceHoverState />
        }
        {
          (!isNewRecord || (isRecording && data)) && <AIInsightContent data={data} />
        }
      </div>
    </SectionWrapper>
  )
}
