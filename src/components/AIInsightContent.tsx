import type {FC} from 'react';
import {medicalRecordItems} from '@/utils/helper.ts';

type Props = {
  data: Note.AIContent | null
}
export const AIInsightContent: FC<Props> = ({data}) => {
  return (
    <div className = "h-full w-full flex flex-col gap-y-[24px] overflow-auto py-[12px]">
      {
        medicalRecordItems.map(item => (['生育史', '婚姻史', '月经史'].includes(item.label) && !data?.[item.key])
          ? null : (
            <div key={item.key}>
              <h2 className = "text-[16px] text-aux5">{item.label}</h2>
              <p className = "whitespace-pre-wrap text-[14px] text-primary">{data?.[item.key]}</p>
            </div>
          )
        )
      }
    </div>
  );
};
