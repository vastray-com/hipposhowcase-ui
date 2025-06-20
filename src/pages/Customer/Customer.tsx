import { RecorderProvider } from '@/components/RecorderProvider/RecorderProvider.tsx'
import { NEW_NOTE_ID } from '@/constant'
import { AIInsight } from '@/pages/Customer/components/AIInsight.tsx'
import { CustomerProfile } from '@/pages/Customer/components/CustomerProfile.tsx'
import { CustomerRecord } from '@/pages/Customer/components/CustomerRecord.tsx'
import { api } from '@/utils/api.ts'
import { App, Button, Input } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { CustomerContext } from './CustomerContext'

const CustomerPage = () => {
  const { message } = App.useApp()

  // 当前选择的客户
  const location = useLocation()
  const customer = location.state as Customer.InternalItem

  // 当前记录的 ID，默认进入为新建，ID 为字符串 NEW_NOTE_ID
  const params = useParams()
  const paramsNoteId = params.noteId as string
  const isNewRecord = paramsNoteId === NEW_NOTE_ID

  const [currentNoteId, setCurrentNoteId] = useState<string>('')
  const contextValue = useMemo(() => ({ currentNoteId, setCurrentNoteId }), [currentNoteId])
  useEffect(() => {
    if (paramsNoteId !== NEW_NOTE_ID) setCurrentNoteId(paramsNoteId)
  }, [paramsNoteId])

  const [noteDetail, setNoteDetail] = useState<Note.Item | null>(null)
  const [isEditStatus, setIsEditStatus] = useState(false)
  const [recordTitle, setRecordTitle] = useState('')
  const initData = useCallback(async () => {
    if (!customer) return
    // 新纪录
    if (isNewRecord) {
      setRecordTitle(`${customer.user_name} ${dayjs().format('YYYYMMDD HH:mm')}`)
    } else {
      try {
        const res = await api.note.getDetail(paramsNoteId)
        if (res.code === 404) {
          message.error('问诊记录不存在')
        } else {
          setRecordTitle(res.data.title)
          setNoteDetail(res.data)
        }
      } catch (e) {
        console.error('获取记录失败', e)
      }
    }
  }, [customer, isNewRecord, message, paramsNoteId])
  useEffect(() => {
    initData()
  }, [initData])

  // 更新 Note
  const updateNoteTitle = useCallback(async (id: string, title: string) => {
    if (!id || !title) return
    try {
      const res = await api.note.update({ id, title })
      if (res.code === 200) {
        setNoteDetail(res.data)
        message.success('更新成功')
        setIsEditStatus(false)
      } else {
        console.error('更新记录失败', res)
        message.error('更新失败，请重试')
      }
    } catch (e) {
      console.error('更新记录失败', e)
      message.error('更新记录失败')
    }
  }, [message])

  // tips 提示
  const [tips, setTips] = useState<string[]>([])

  // 未携带客户信息
  if (!location.state) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-y-[12px]">
        <div className="text-title">请先选择客户</div>
        <Link to="/select-customer">前往选择</Link>
      </div>
    )
  }

  return (
    <RecorderProvider>
      <div className="h-full w-full">
        <h1 className="h-[48px] flex items-center pb-[16px] text-[20px] text-title font-500">
          {
            isEditStatus
              ? <Input className="w-[30%]" value={recordTitle} onChange={e => setRecordTitle(e.target.value)} />
              : <span>{recordTitle}</span>
          }
          {
            isEditStatus
              ? <Button onClick={async () => updateNoteTitle(currentNoteId, recordTitle)} className="ml-[6px]">确定</Button>
              : (
                  <Button
                    onClick={() => setIsEditStatus(true)}
                    className="ml-[6px]"
                    type="text"
                    icon={<i className="i-icon-park-outline:edit-two text-[20px] text-secondary" />}
                  />
                )
          }
        </h1>

        <CustomerContext.Provider value={contextValue}>
          <div className="h-[calc(100%_-_48px)] flex items-center justify-between gap-x-[16px] children:shrink-0 children:grow-0 children:basis-[calc((100%_-_16px_-_16px)_/_3)]">
            <CustomerProfile customer={customer} />
            <CustomerRecord isNewRecord={isNewRecord} noteDetail={noteDetail} customer={customer} recordTitle={recordTitle} onTips={setTips} />
            <AIInsight isNewRecord={isNewRecord} content={noteDetail?.content} recommend={noteDetail?.recommend} tips={tips} />
          </div>
        </CustomerContext.Provider>
      </div>
    </RecorderProvider>
  )
}

export default CustomerPage
