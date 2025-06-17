import type { MyTabsItems } from '@/components/Tabs.tsx'
import type { Dayjs } from 'dayjs'
import type { FC, ReactNode } from 'react'
import { AIInsightContent } from '@/components/AIInsightContent.tsx'
import { Sentences } from '@/components/Sentences.tsx'
import { MyTabs } from '@/components/Tabs.tsx'
import { SectionWrapper } from '@/pages/Customer/components/SectionWrapper.tsx'
import { api } from '@/utils/api.ts'
import { parseAIInsightContent } from '@/utils/helper.ts'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { Button, Card, Empty, Skeleton, Typography } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'

// 详情面板状态类型
type DetailInfo = {
  status: 'edm' | 'execution' | 'noteHistory' | null
  data: Project.ExecutionInfo | Report.Item | Note.Item | null
}

// 转换两种类型数据到列表所需数据
type ListItemProps = {
  date: Dayjs
  title: string
  desc: ReactNode
  icon: ReactNode
  ellipsisRow: number
  onClick?: () => void
  type: Exclude<DetailInfo['status'], null>
  rawData: Exclude<DetailInfo['data'], null>
}
const transformReportField = (edm: Report.Item): ListItemProps => ({
  date: dayjs(edm.edm_date),
  title: `体检报告 ${dayjs(edm.edm_date).format('YYYY-MM-DD')}`,
  desc: edm.edm_summary.summary,
  ellipsisRow: 2,
  icon: (
    <i className="i-icon-park-outline:table-report text-[18px]" />
  ),
  type: 'edm',
  rawData: edm,
})

const transformExecutionField = (item: Project.ExecutionInfo): ListItemProps => {
  const date = dayjs(`${item.rq} ${item.ontime}`)
  return {
    date,
    title: item.xmmch,
    desc: `单据编号：${item.djbh}，执行次数：${item.retries}，转换次数：${item.refersCount}，总次数：${item.times}，执行时间：${date.format('YYYY-MM-DD HH:mm:ss')}`,
    ellipsisRow: 2,
    icon: <i className="i-icon-park-outline:shield-add text-[18px]" />,
    type: 'execution',
    rawData: item,
  }
}

const transformHistoryField = (item: Note.Item): ListItemProps => {
  const date = dayjs(item.created_at)
  return {
    date,
    title: item.title,
    desc: item.summary ?? '',
    ellipsisRow: 2,
    icon: <i className="i-icon-park-outline:view-list text-[18px]" />,
    type: 'noteHistory',
    rawData: item,
  }
}

// 列表项展示组件
const ListItem: FC<ListItemProps> = ({ date, title, desc, icon, ellipsisRow, onClick, type }) => {
  const canClick = type === 'edm' || type === 'noteHistory'
  return (
    <div
      className={clsx('mb-[12px] rounded-1 bg-[#f8f8f8] px-[12px] pb-[1px] pt-[12px]', canClick && 'cursor-pointer')}
      onClick={() => canClick && onClick?.()}
    >
      <p className="mb-[8px] flex items-center gap-x-[12px] text-primary font-500">
        <span>{date.format('YYYY/MM/DD')}</span>
        <span>{icon}</span>
        <span>{title}</span>
      </p>
      <Typography.Paragraph className="text-secondary" ellipsis={{ rows: ellipsisRow }}>{desc}</Typography.Paragraph>
    </div>
  )
}

// 详情关闭按钮
const CloseBtn = ({ status, onClick }: { status: DetailInfo['status'], onClick?: () => void }) => {
  return status !== null
    ? (
        <Button
          type="text"
          icon={<i className="i-icon-park-outline:collapse-text-input text-[20px] text-secondary" />}
          onClick={onClick}
        />
      )
    : <div />
}

type Props = {
  customer: Customer.InternalItem
}

export const CustomerProfile: FC<Props> = ({ customer }) => {
  const { noteId } = useParams()

  const [loading, setLoading] = useState(false)
  const [edmList, setEdmList] = useState<Report.List>([])
  const [projectData, setProjectData] = useState<Project.Data | null>(null)
  const [historyList, setHistoryList] = useState<Note.List>([])

  // 展开数据详情
  const [detailInfo, setDetailInfo] = useState<DetailInfo>({
    status: null,
    data: null,
  })
  const openDetail = (type: Exclude<DetailInfo['status'], null>, data: Exclude<DetailInfo['data'], null>) => {
    setDetailInfo({ status: type, data })
  }
  const closeDetail = useCallback(() => {
    setDetailInfo({ status: null, data: null })
  }, [])

  // 拉取数据
  const fetchData = useCallback(async () => {
    const sale = ls.get(LS_KEY.SALE)
    if (!sale) return
    setLoading(true)
    try {
      const [edmRes, projectRes, historyRes] = await Promise.all([
        api.report.getList({ saleId: customer.sale_id, userName: customer.user_name }),
        api.project.getList(customer.user_id),
        api.note.getSaleCustomerHistory({ sale_id: sale.id, user_id: customer.user_id }),
      ])
      setEdmList(edmRes.data.sort((a, b) => (dayjs(a.edm_date).isBefore(dayjs(b.edm_date)) ? 1 : -1)))
      setProjectData(projectRes.data)
      setHistoryList(historyRes.data.filter(item => item.id.id.String !== noteId))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [customer.sale_id, customer.user_id, customer.user_name, noteId])
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 处理 Tab 切换
  const topTab = useMemo<MyTabsItems>(() => {
    return [
      {
        key: 'profile',
        label: '基础资料',
        render: (
          <Card className="h-full overflow-hidden b-0 bg-[#f9f9f9]" size="small">
            <div className="h-full w-full flex flex-col gap-y-[4px]">
              <p>{`姓名：${customer.user_name}`}</p>
              <p>{`性别：${customer.gender}`}</p>
              <p>{`年龄：${customer.age}岁`}</p>
              <p>{`销售：${customer.sale_name}`}</p>
              <p>{`用户等级：${customer.user_level}`}</p>
              <p>{`总消费：${customer.total_consumption ?? '0'}元`}</p>
            </div>
          </Card>
        ),
      },
      // {
      //   key: 'project',
      //   label: '已购项目',
      //   render: (
      //     <Card className="h-full overflow-auto b-0 bg-[#f9f9f9]" size="small" styles={{ body: { padding: '0 8px 0 8px' } }}>
      //       <table className="pos-relative h-full w-full overflow-auto text-primary">
      //         <thead className="sticky top-0 mt-[12px] h-[32px] bg-[#f9f9f9]">
      //           <tr>
      //             <th className="text-left">项目名称</th>
      //             <th className="text-center">总次数</th>
      //             <th className="text-center">实施次数</th>
      //             <th className="text-center">剩余次数</th>
      //           </tr>
      //         </thead>
      //
      //         <tbody>
      //           {
      //             (projectData && projectData.userBasicProjectInfoPoList.length > 0)
      //               ? projectData.userBasicProjectInfoPoList.map((project, idx) => (
      //                   <tr key={idx} className="h-[32px] text-secondary">
      //                     <td className="text-left">{project.xmmch}</td>
      //                     <td className="w-[64px] text-center">{project.times}</td>
      //                     <td className="w-[64px] text-center">{project.leaveearly}</td>
      //                     <td className="w-[64px] text-center">{project.times - project.leaveearly}</td>
      //                   </tr>
      //                 ))
      //               : <tr><td colSpan={4} className="h-[128px] text-center text-secondary">暂无已购项目</td></tr>
      //           }
      //         </tbody>
      //       </table>
      //     </Card>
      //   ),
      // },
    ]
  }, [customer])

  const bottomTab = useMemo<MyTabsItems>(() => {
    const executionItemList = (projectData?.userProjectExecutionInfoPoList || []).map(transformExecutionField)
    const edmItemList = edmList.map(transformReportField)
    const historyItemList = historyList.map(transformHistoryField)
    const allList = executionItemList
      .concat(edmItemList)
      .concat(historyItemList)
      .sort((a, b) => (a.date.isBefore(b.date)) ? 1 : -1)

    return [
      {
        key: 'all',
        label: '全部',
        render: allList.length > 0
          ? allList.map((item, idx) => (
              <ListItem {...item} key={idx} onClick={() => openDetail(item.type, item.rawData)} />
            ))
          : <Empty description="暂无数据" className="mt-[24px]" />,
      },
      {
        key: 'edm',
        label: '体检报告',
        render: edmItemList.length > 0
          ? edmItemList.map((edm, idx) => (
              <ListItem {...edm} key={idx} onClick={() => openDetail(edm.type, edm.rawData)} />
            ))
          : <Empty description="暂无体检报告" className="mt-[24px]" />,
      },
      {
        key: 'execution',
        label: '消费记录',
        render: executionItemList.length > 0
          ? executionItemList.map((execution, idx) => (
              <ListItem {...execution} key={idx} onClick={() => openDetail(execution.type, execution.rawData)} />
            ))
          : <Empty description="暂无消费记录" className="mt-[24px]" />,
      },
      {
        key: 'noteHistory',
        label: '面诊记录',
        render: historyItemList.length > 0
          ? historyItemList.map((item, idx) => (
              <ListItem {...item} key={idx} onClick={() => openDetail(item.type, item.rawData)} />
            ))
          : <Empty description="暂无面诊记录" className="mt-[24px]" />,
      },
    ]
  }, [edmList, historyList, projectData?.userProjectExecutionInfoPoList])

  return (
    <SectionWrapper title="客户资料">
      <div className="h-full py-[16px]">
        <Skeleton
          loading={loading}
          active
          paragraph={{ rows: 10 }}
          title={false}
          style={{ height: '256px' }}
        >
          <div className="h-[256px]">
            <MyTabs items={topTab} />
          </div>
        </Skeleton>

        <Skeleton
          loading={loading}
          active
          paragraph={{ rows: 10 }}
          title={false}
          style={{ height: 'calc(100% - 256px - 16px)', marginTop: '16px' }}
        >
          <div className="mt-[16px] h-[calc(100%_-_256px_-_16px)]">
            <MyTabs items={bottomTab} />
          </div>
        </Skeleton>
      </div>

      <div className={clsx('rounded-2 pos-absolute overflow-auto left-0 top-0 h-full w-full bg-white p-[16px]', detailInfo.status === null ? 'hidden' : 'visible')}>
        {
          detailInfo.status === 'edm'
            ? (
                <div>
                  <div className="mb-[12px] flex items-center justify-between">
                    <h3 className="text-primary font-normal">{`体检报告 ${dayjs((detailInfo.data as Report.Item).edm_date).format('YYYY-MM-DD')}`}</h3>
                    <CloseBtn status={detailInfo.status} onClick={closeDetail} />
                  </div>
                  <div className="mt-[12px] rounded-2 bg-[#f8f8f8] p-[12px]">
                    <h4 className="text-title">异常指标</h4>
                    <p className="mt-[8px] whitespace-pre-wrap text-primary">{(detailInfo.data as Report.Item).edm_summary.anomaly_index}</p>
                    <h4 className="mt-[24px] text-title">报告解读</h4>
                    <p className="mt-[8px] whitespace-pre-wrap text-primary">{(detailInfo.data as Report.Item).edm_summary.summary}</p>
                    <h4 className="mt-[24px] text-title">产品推荐</h4>
                    <p className="mt-[8px] whitespace-pre-wrap text-primary">{(detailInfo.data as Report.Item).edm_summary.recommend}</p>
                  </div>
                </div>
              )
            : detailInfo.status === 'noteHistory'
              ? (
                  <div>
                    <div className="mb-[12px] flex items-center justify-between">
                      <h3 className="text-primary font-normal">{(detailInfo.data as Note.Item).title}</h3>
                      <CloseBtn status={detailInfo.status} onClick={closeDetail} />
                    </div>

                    <MyTabs
                      defaultActiveKey="aiInsight"
                      items={[
                        {
                          key: 'sentences',
                          label: '面诊录音',
                          render: <Sentences sentences={(detailInfo.data as Note.Item).sentences} classNames="h-full" />,
                        },
                        {
                          key: 'aiInsight',
                          label: 'AI 辅助诊断结果',
                          render: (
                            <div>
                              <AIInsightContent
                                data={parseAIInsightContent({
                                  content: (detailInfo.data as Note.Item).content,
                                  recommend: (detailInfo.data as Note.Item).recommend,
                                })}
                              />
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                )
              : null
        }
      </div>
    </SectionWrapper>
  )
}
