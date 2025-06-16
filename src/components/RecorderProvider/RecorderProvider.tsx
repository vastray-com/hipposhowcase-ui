import type { FC, ReactNode } from 'react'
import type { StartProps, StopProps } from './RecorderContext'
import { useModal } from '@/hooks/useModal.tsx'
import workletUrl from '@/utils/recorder/recorder-worklet.js?url'
import { App, Button, Form, Modal, Select } from 'antd'
import { useCallback, useMemo, useRef, useState } from 'react'
import { RecorderContext } from './RecorderContext'

const CHANNEL_COUNT = 2
const SAMPLE_RATE = 16000

type Props = {
  children: ReactNode
}
export const RecorderProvider: FC<Props> = ({ children }) => {
  const { message } = App.useApp()
  const modal = useModal()
  const [isRecording, setIsRecording] = useState(false)

  const stream = useRef<MediaStream | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const audioWorkletNode = useRef<AudioWorkletNode | null>(null)
  const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null)
  const deviceRef = useRef<MediaDeviceInfo | null>(null)

  const [waveAnalyser, setWaveAnalyser] = useState<AnalyserNode | null>(null)
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null)

  const getDevice = useCallback(async () => {
    if (deviceRef.current) {
      console.info('当前已选择音频输入设备:', deviceRef.current)
      return deviceRef.current
    }

    // 检查麦克风权限状态
    let permissionState = null
    try {
      const status = await navigator.permissions.query({ name: 'microphone' })
      console.info('麦克风权限状态:', status)
      permissionState = status.state
      // 可监听权限变更：status.onchange = () => {}
    } catch (e) {
      // 某些浏览器可能不支持 Permissions API，此时直接 fallback
      console.warn('无法查询权限状态，直接尝试请求权限')
    }

    // 如果不是已授权状态，尝试请求权限
    if (permissionState !== 'granted') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        message.error(`当前无法访问麦克风，请检查浏览器权限设置`)
        return null
      }
    }

    // 枚举设备
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = devices.filter(device => device.kind === 'audioinput' && device.deviceId !== '')
    console.info('可用的音频输入设备:', audioInputs)

    // 检查是否有可用的音频输入设备
    if (audioInputs.length === 0) {
      console.error('没有可用的音频输入设备')
      return null
    }
    // 只有一个音频输入设备，直接使用
    if (audioInputs.length === 1) {
      const device = audioInputs[0]
      console.info('只有一个音频输入设备，自动选择:', device)
      deviceRef.current = device
      return device
    }

    // 多个音频输入设备，先检查是否有默认设备
    const defaultDevice = audioInputs.find(device => device.deviceId === 'default')
    if (defaultDevice) {
      console.info('找到默认音频输入设备:', defaultDevice)
      deviceRef.current = defaultDevice
      return defaultDevice
    }

    // 弹出选择框
    return new Promise<MediaDeviceInfo | null>((resolve) => {
      modal.confirm({
        title: '选择要使用的麦克风',
        footer: null,
        content: (
          <Form<{ deviceId: string }>
            preserve={false}
            onFinish={(v) => {
              if (v.deviceId) {
                // 关闭所有 Modal
                Modal.destroyAll()
                const device = audioInputs.find(input => input.deviceId === v.deviceId)
                if (device) {
                  console.info('选择的音频输入设备:', device)
                  deviceRef.current = device
                  resolve(device)
                } else {
                  message.error('未找到选择的音频输入设备')
                  resolve(null)
                }
              }
            }}
            initialValues={{ deviceId: audioInputs[0].deviceId }}
          >
            <Form.Item name="deviceId" noStyle>
              <Select
                size="large"
                className="w-full"
                options={audioInputs.map(input => ({
                  label: input.label,
                  value: input.deviceId,
                }))}
              />
            </Form.Item>
            <div className="mt-[12px] w-full flex items-center justify-center gap-x-[12px]">
              <Button
                htmlType="button"
                size="large"
                className="w-[50%] btn-solid-gray"
                onClick={() => {
                  Modal.destroyAll()
                  resolve(null)
                }}
              >
                取消
              </Button>
              <Form.Item noStyle>
                <Button htmlType="submit" size="large" type="primary" className="w-[50%] btn-solid-aux2">
                  确定
                </Button>
              </Form.Item>
            </div>
          </Form>
        ),
        onCancel: () => resolve(null),
      })
    })
  }, [modal, message])

  const startRecording = useCallback(async ({ onStart, onChunk }: StartProps) => {
    if (isRecording) return
    setIsRecording(true)

    // 获取多声道音频流，channelCount: 2
    stream.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceRef.current && { deviceId: deviceRef.current.deviceId }),
        channelCount: CHANNEL_COUNT,
        sampleRate: SAMPLE_RATE,
        noiseSuppression: false,
        echoCancellation: false,
      },
    })

    // 创建 AudioContext，指定采样率
    audioContext.current = new AudioContext({ sampleRate: SAMPLE_RATE, latencyHint: 'interactive' })

    // 创建音频分析器
    const analyser = audioContext.current.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8
    analyser.minDecibels = -95
    analyser.maxDecibels = -35

    console.info('AudioContext sampleRate:', audioContext.current?.sampleRate)
    console.info('Stream settings:', stream.current?.getAudioTracks()[0].getSettings())

    // 创建音频源节点
    sourceNode.current = audioContext.current.createMediaStreamSource(stream.current)

    // 连接音频源节点到分析器
    sourceNode.current.connect(analyser)
    setWaveAnalyser(analyser)
    setDataArray(new Uint8Array(analyser.frequencyBinCount))

    // 加载 AudioWorkletProcessor 脚本
    await audioContext.current.audioWorklet.addModule(workletUrl)
    // 创建 AudioWorkletNode
    audioWorkletNode.current = new AudioWorkletNode(audioContext.current, 'recorder-processor', {
      processorOptions: {
        sampleRate: SAMPLE_RATE,
        channels: CHANNEL_COUNT,
      },
    })
    // 收取 AudioWorklet 发送数据
    audioWorkletNode.current.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(e.data)))
      onChunk?.(base64Data)
    }

    // 连接节点
    sourceNode.current.connect(audioWorkletNode.current)
    audioWorkletNode.current.connect(audioContext.current.destination)

    // 触发开始回调
    onStart?.()
  }, [isRecording])

  const stopRecording = useCallback(async ({ onStop }: StopProps) => {
    if (!isRecording) return
    setIsRecording(false)
    console.info('录音线程准备停止')

    // 停止所有音轨
    stream.current?.getTracks()?.forEach(track => track.stop())
    stream.current = null
    sourceNode.current?.disconnect()
    sourceNode.current = null
    audioWorkletNode.current?.disconnect()
    audioWorkletNode.current = null
    await audioContext.current?.close()
    audioContext.current = null

    waveAnalyser?.disconnect()

    // 触发停止回调
    onStop?.()
  }, [isRecording, waveAnalyser])

  const value = useMemo(() => ({
    startRecording,
    stopRecording,
    getDevice,
    isRecording,
    waveState: {
      analyser: waveAnalyser,
      dataArray,
    },
  }), [startRecording, stopRecording, getDevice, isRecording, waveAnalyser, dataArray])

  return <RecorderContext.Provider value={value}>{children}</RecorderContext.Provider>
}
