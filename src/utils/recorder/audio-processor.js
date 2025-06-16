class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    const { sampleRate, channels } = options.processorOptions
    this.sampleRate = sampleRate
    this.channels = channels
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length < this.channels) return true

    const buffer = new Int16Array(input[0].length * this.channels)
    const view = new DataView(buffer.buffer)

    // 小端序写入
    for (let i = 0; i < input[0].length; i++) {
      const left = this._floatTo16Bit(input[0][i])
      const right = this._floatTo16Bit(input[1][i])

      view.setInt16(i * 4, left, true) // 左声道 (0-1字节)
      view.setInt16(i * 4 + 2, right, true) // 右声道 (2-3字节)
    }

    this.port.postMessage(buffer.buffer)
    return true
  }

  _floatTo16Bit(sample) {
    sample = Math.max(-1, Math.min(1, sample))
    return sample * (sample < 0 ? 0x8000 : 0x7FFF)
  }
}

registerProcessor('recorder-processor', AudioProcessor)
