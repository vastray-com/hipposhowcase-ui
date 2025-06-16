import { createContext } from 'react'

export type StartProps = {
  onChunk?: (data: string) => void
  onStart?: () => void
}
export type StopProps = {
  onStop?: () => void
}

type Type = {
  startRecording: (props: StartProps) => void
  stopRecording: (props: StopProps) => void
  getDevice: () => Promise<MediaDeviceInfo | null>
  isRecording: boolean
  waveState: {
    analyser: AnalyserNode | null
    dataArray: Uint8Array | null
  }
}

export const RecorderContext = createContext<Type>({
  startRecording: () => {},
  stopRecording: () => {},
  getDevice: async () => null,
  isRecording: false,
  waveState: {
    analyser: null,
    dataArray: null,
  },
})
