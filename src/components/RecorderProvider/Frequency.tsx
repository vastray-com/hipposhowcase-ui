import React, { useEffect, useRef } from 'react'

type AudioVisualizerProps = {
  audioUrl?: string
  useMicrophone?: boolean
  width?: number
  height?: number
  backgroundColor?: string
  gradientColors?: string[]
  barWidth?: number
  barSpacing?: number
  barRadius?: number
  smoothingTimeConstant?: number
  animationSpeed?: number
  fftSize?: number
  minDecibels?: number
  maxDecibels?: number
  onAudioLoad?: () => void
  onAudioEnd?: () => void
  onError?: (error: Error) => void
  waveState?: {
    analyser: AnalyserNode | null
    dataArray: Uint8Array | null
  }
}

const createGradient = (
  ctx: CanvasRenderingContext2D,
  type: 'linear' | 'radial',
  colors: string[],
  width: number,
  height: number,
  radius?: number,
) => {
  if (!colors || colors.length < 2) return colors[0]

  let gradient
  if (type === 'linear') {
    gradient = ctx.createLinearGradient(0, height, 0, 0)
  } else {
    gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      radius || 0,
    )
  }

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })

  return gradient
}

export const Frequency: React.FC<AudioVisualizerProps> = ({
  width = 800,
  height = 200,
  gradientColors = ['#00bcd4', '#4CAF50', '#8BC34A'],
  barWidth = 6,
  barSpacing = 2,
  waveState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)

  const draw = () => {
    if (!canvasRef.current || !waveState?.analyser || !waveState?.dataArray) return

    // console.log('waveState?.analyser', waveState?.analyser)
    // console.log('waveState?.dataArray', waveState?.dataArray)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = waveState.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    waveState.analyser.getByteFrequencyData(dataArray)

    ctx.clearRect(0, 0, width, height)

    const barCount = Math.min(bufferLength, Math.floor(width / (barWidth + barSpacing)))
    const totalWidth = barCount * (barWidth + barSpacing)
    const startX = (width - totalWidth) / 2

    ctx.fillStyle = createGradient(ctx, 'linear', gradientColors, width, height)

    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArray[i] / 255.0) * height
      const x = startX + i * (barWidth + barSpacing)
      const y = height - barHeight

      ctx.fillRect(x, y, barWidth, barHeight)
    }

    animationFrameId.current = requestAnimationFrame(draw)
  }

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
    }

    draw()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [waveState, width, height])

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }} className="relative">
      <canvas className="h-full w-full" ref={canvasRef} />
    </div>
  )
}
