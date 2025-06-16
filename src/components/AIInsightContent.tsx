import type { FC } from 'react'

type Props = {
  data: Note.AIContent | null
}
export const AIInsightContent: FC<Props> = ({ data }) => {
  return (
    <div className="h-full w-full flex flex-col gap-y-[24px] overflow-auto py-[12px]">
      <div>
        <h2 className="text-[16px] text-aux5">病史情况</h2>
        <p className="whitespace-pre-wrap text-[14px] text-primary">{data?.history}</p>
      </div>

      <div>
        <h2 className="text-[16px] text-aux5">诊断推荐</h2>
        <p className="whitespace-pre-wrap text-[14px] text-primary">{data?.diagnosis}</p>
      </div>

      <div>
        <h2 className="text-[16px] text-aux5">疾病风险</h2>
        <p className="whitespace-pre-wrap text-[14px] text-primary">{data?.risk}</p>
      </div>

      <div>
        <h2 className="text-[16px] text-aux5">产品推荐</h2>
        <p className="whitespace-pre-wrap text-[14px] text-primary">{data?.recommend}</p>
      </div>

      <div>
        <h2 className="text-[16px] text-aux5">健康建议</h2>
        <p className="whitespace-pre-wrap text-[14px] text-primary">{data?.advice}</p>
      </div>
    </div>
  )
}
