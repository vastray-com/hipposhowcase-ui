import type { FC } from 'react'
import { Frequency } from '@/components/RecorderProvider/Frequency'
import { RecorderContext } from '@/components/RecorderProvider/RecorderContext.tsx'
import { Sentences } from '@/components/Sentences.tsx'
import { useModal } from '@/hooks/useModal.tsx'
import { SectionWrapper } from '@/pages/Customer/components/SectionWrapper.tsx'
import { CustomerContext } from '@/pages/Customer/CustomerContext.tsx'
import { api } from '@/utils/api.ts'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { useWebSocket } from 'ahooks'
import { App, Button } from 'antd'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useBlocker } from 'react-router'
import { useNavigate } from 'react-router-dom'

enum RecordStatus {
  IDLE,
  RECORDING,
}

type WSMessage = {
  event: 'recognized'
  data: Note.Sentence
} | {
  event: 'tips'
  data: string[]
}

const url = new URL(import.meta.env.VITE_API_URL)

type Props = {
  noteDetail: Note.Item | null
  isNewRecord: boolean
  customer: Customer.InternalItem
  recordTitle: string
  onTips: (tips: string[]) => void
}

export const CustomerRecord: FC<Props> = ({ noteDetail, customer, recordTitle, isNewRecord ,onTips}) => {
  const nav = useNavigate()
  const { currentNoteId, setCurrentNoteId } = useContext(CustomerContext)
  const { getDevice, isRecording, startRecording, stopRecording, waveState } = useContext(RecorderContext)
  const { message } = App.useApp()
  const modal = useModal()

  const [messages, setMessages] = useState<Note.Sentences>([])
  useEffect(() => {
    if (noteDetail) setMessages(noteDetail.sentences || [])
  }, [noteDetail])

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<RecordStatus>(RecordStatus.IDLE)
  const [conn, setConn] = useState('')

  // 录音时，点击返回路由拦截
  const shouldBlock = useMemo(() => status === RecordStatus.RECORDING, [status])
  const blocker = useBlocker(shouldBlock)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      modal.confirm({
        title: '离开当前页面',
        content: '当前正在录音，是否停止问诊并离开？',
        onOk: () => blocker.proceed(),
        okText: '确定离开',
      })
    }
  }, [blocker, modal])

  const { sendMessage, connect, disconnect } = useWebSocket(conn, {
    onOpen: () => {
      console.info('WebSocket 已连接，准备启动录音')
      startRecording({
        onStart: () => {
          setStatus(RecordStatus.RECORDING)
          setLoading(false)
        },
        onChunk: d => sendMessage(JSON.stringify({ event: 'recording', data: d })),
      })
    },
    onMessage: (message: MessageEvent<string>) => {
      const msg = JSON.parse(message.data) as WSMessage
      console.info('WebSocket 收到消息:', msg)
      if (msg.event === 'recognized') {
        const { role_id, content, begin_time } = msg.data
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          // 如果当前消息的角色和时间戳与最后一条消息相同，则更新最后一条消息
          if (lastMessage && lastMessage.role_id === role_id && lastMessage.begin_time === begin_time) {
            lastMessage.content = content
            return [...prev]
          }
          return [...prev, msg.data]
        })
      } else if (msg.event === 'tips') {
        if(msg.data.length > 0 ) onTips(msg.data)
      }
    },
    onClose: () => {
      console.info('WebSocket 已关闭')
      setStatus(RecordStatus.IDLE)
      setLoading(false)
      setTimeout(async () => nav(`/note/${currentNoteId}`, { state: customer }), 0)
    },
    manual: true,
  })

  const onStartRecord = useCallback(async (recordId?: string) => {
    if (isRecording) return
    console.info('点击继续录音')
    setLoading(true)
    const device = await getDevice()
    if (!device) {
      console.error('没有可用的音频输入设备')
      setLoading(false)
      return
    }

    try {
      const sale = ls.get(LS_KEY.SALE)
      if (!sale) {
        message.error('当前登录用户信息异常，请重新登录')
        return
      }

      // 如果是新录音，创建一个新的录音记录
      if (!recordId && isNewRecord) {
        const noteRes = await api.note.create({
          title: recordTitle,
          sale_id: sale.id,
          patient_id: customer.user_id,
          patient_info: customer,
          sentences: [],
        })
        console.info('创建录音记录成功', noteRes)
        recordId = noteRes.data.id.id.String
        setCurrentNoteId(recordId)
      }

      setConn(`${url.protocol === 'http:' ? 'ws' : 'wss'}://${url.host}/api/ws/asr?device_name=${device.label}&record_id=${recordId}&sep_roles=false`)
      setTimeout(connect, 10)
    } catch (e) {
      console.error('创建录音记录失败', e)
      message.error('创建录音记录失败')
    } finally {
      setLoading(false)
    }
  }, [isRecording, getDevice, isNewRecord, connect, message, recordTitle, customer, setCurrentNoteId])

  const onCompleteRecord = async () => {
    if (!isRecording) return
    console.info('点击完成录音')
    setLoading(true)
    stopRecording({
      onStop: () => {
        console.info('录音线程停止')
        sendMessage(JSON.stringify({ event: 'stop' }))
        setTimeout(disconnect, 500)
      },
    })
  }

  // 未开始录音时
  if (status === RecordStatus.IDLE && isNewRecord) {
    return (
      <SectionWrapper title="录音">
        <div className="h-full w-full flex flex-col items-center justify-center gap-y-[12px]">
          <span>点击按钮，开始本次问诊记录</span>
          <Button ghost type="primary" onClick={async () => onStartRecord()} loading={loading}>开始录音</Button>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper title="录音">
      <div className="h-full w-full">
        <Sentences classNames="h-[calc(100%_-_60px_-_1px)]" sentences={messages} />

        <div className="h-[60px] w-full flex shrink-0 grow-0 items-center items-center justify-between b-t-1 b-t-[#DCE1EC] b-t-solid py-[12px]">
          { status === RecordStatus.RECORDING && (
            <>
              <div className="h-[40px] w-[120px] flex items-center justify-center">
                {
                  waveState && waveState.analyser && (
                    <Frequency
                      width={120}
                      height={36}
                      backgroundColor="#fff"
                      gradientColors={['#006400', '#32cd32', '#ffd700', '#ff8000', '#ff3030', '#ff0066']}
                      barWidth={4}
                      barSpacing={1}
                      barRadius={2}
                      waveState={waveState}
                    />
                  )
                }
              </div>
              {
                status === RecordStatus.RECORDING
                && <Button size="large" loading={loading} ghost type="primary" onClick={onCompleteRecord}>停止录音</Button>
              }
            </>
          )}

          {
            status === RecordStatus.IDLE && (
              <div className="w-full flex items-center justify-center">
                <Button
                  loading={loading}
                  ghost
                  type="primary"
                  onClick={async () => onStartRecord(currentNoteId)}
                >
                  继续录音
                </Button>
              </div>
            )
          }
        </div>
      </div>
    </SectionWrapper>
  )
}
