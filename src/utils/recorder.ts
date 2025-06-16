import Recorder from 'recorder-core'
import 'recorder-core/src/engine/wav'
import 'recorder-core/src/engine/pcm'

type Format = 'mp3' | 'pcm' | 'wav'
type OnBlobAvailable = (blob: Blob) => void
type StartOpts = {
  blobInterval?: number
  frameSize?: number
  onBlobAvailable?: OnBlobAvailable
  onStartError?: (msg: string, isUserNotAllow: boolean) => void
  onStartOk?: () => void
}

Recorder.TrafficImgUrl = ''
// Recorder.CLog = () => {}

// let testOutputWavLog = false; // 本测试如果不是输出wav格式，就顺带打一份wav的log，录音后执行mp3、wav合并的demo代码可对比音质
const testSampleRate = 16000
const testBitRate = 16

let SendInterval = 10000
let SendFrameSize = 640

let realTimeSendTryType: Format
let realTimeSendTryEncBusy: number
let realTimeSendTryTime = 0
let realTimeSendTryNumber: number
let transferUploadNumberMax: number
let realTimeSendTryChunk: any
let realTimeSendTryChunks: any

let onBlobAvailable: OnBlobAvailable | null = null

// 重置环境，每次开始录音时必须先调用此方法，清理环境
function RealTimeSendTryReset(type: Format) {
  realTimeSendTryType = type
  realTimeSendTryTime = 0
  realTimeSendTryChunks = null
}

// =====实时处理核心函数==========
function RealTimeSendWav(buffers: any, bufferSampleRate: number, isClose: boolean) {
  const t1 = Date.now()

  if (realTimeSendTryTime === 0) {
    realTimeSendTryTime = t1
    realTimeSendTryEncBusy = 0
    realTimeSendTryNumber = 0
    transferUploadNumberMax = 0
    realTimeSendTryChunk = null
  }

  if (!isClose && t1 - realTimeSendTryTime < SendInterval) {
    return // 控制缓冲达到指定间隔才进行传输
  }

  realTimeSendTryTime = t1
  const num = ++realTimeSendTryNumber

  let pcm = []
  let pcmSampleRate = 0

  if (buffers.length > 0) {
    // 借用SampleData函数进行数据的连续处理，采样率转换是顺带的，得到新的pcm数据
    const chunk = Recorder.SampleData(
      buffers,
      bufferSampleRate,
      testSampleRate,
      realTimeSendTryChunk,
      { frameType: isClose ? '' : realTimeSendTryType },
    )

    // 清理已处理完的缓冲数据，释放内存以支持长时间录音，最后完成录音时不能调用stop，因为数据已经被清掉了
    for (
      let i = realTimeSendTryChunk ? realTimeSendTryChunk.index : 0;
      i < chunk.index;
      i++
    ) {
      buffers[i] = null
    }
    realTimeSendTryChunk = chunk // 此时的chunk.data就是原始的音频16位pcm数据（小端LE），直接保存即为16位pcm文件、加个wav头即为wav文件、丢给mp3编码器转一下码即为mp3文件

    pcm = chunk.data
    pcmSampleRate = chunk.sampleRate
  }

  // 没有新数据，或结束时的数据量太小，不能进行mock转码
  if (pcm.length === 0 || (isClose && pcm.length < 2000)) {
    TransferUpload(num, null, 0, null, isClose)
    return
  }

  // 实时编码队列阻塞处理
  if (!isClose) {
    if (realTimeSendTryEncBusy >= 2) {
      console.info('编码队列阻塞，已丢弃一帧', 1)
      return
    }
  }
  realTimeSendTryEncBusy++

  // 通过mock方法实时转码成mp3、wav；16位pcm格式可以不经过此操作，直接发送new Blob([pcm.buffer],{type:"audio/pcm"}) 要8位的就必须转码
  const encStartTime = Date.now()
  const recMock = Recorder({
    bitRate: testBitRate, // 比特率
    sampleRate: testSampleRate, // 采样率
    type: realTimeSendTryType,
  })
  recMock.mock(pcm, pcmSampleRate)

  recMock.stop(
    (blob: any, duration: number) => {
      if (realTimeSendTryEncBusy)
        realTimeSendTryEncBusy--
      blob.encTime = Date.now() - encStartTime

      // 转码好就推入传输
      TransferUpload(num, blob, duration, recMock, isClose)
    },
    () => {
      if (realTimeSendTryEncBusy)
        realTimeSendTryEncBusy--
    },
  )

  // if (testOutputWavLog && realTimeSendTryType !== 'wav') {
  //   // 测试输出一份wav，方便对比数据
  //   let recMock2 = Recorder({
  //     bitRate: 16,
  //     sampleRate: testSampleRate,
  //     type: 'wav',
  //   });
  //   recMock2.mock(pcm, pcmSampleRate);
  //   recMock2.stop((blob, duration) => {
  //     let logMsg =
  //       'No.' + (number < 100 ? ('000' + number).substr(-3) : number);
  //     Runtime.LogAudio(blob, duration, recMock2, logMsg);
  //   });
  // }
}

function RealTimeSendPcm(buffers: any, bufferSampleRate: number, isClose: boolean) {
  if (realTimeSendTryChunks === null) {
    realTimeSendTryNumber = 0
    transferUploadNumberMax = 0
    realTimeSendTryChunk = null
    realTimeSendTryChunks = []
  }

  // 配置有效性检查
  if (testBitRate === 16 && SendFrameSize % 2 === 1) {
    return
  }

  let pcm = []
  let pcmSampleRate = 0
  if (buffers.length > 0) {
    console.log('RealTimeSendPcm', buffers, bufferSampleRate);
    // 借用SampleData函数进行数据的连续处理，采样率转换是顺带的，得到新的pcm数据
    const chunk = Recorder.SampleData(
      buffers,
      bufferSampleRate,
      testSampleRate,
      realTimeSendTryChunk,
    )

    // 清理已处理完的缓冲数据，释放内存以支持长时间录音，最后完成录音时不能调用stop，因为数据已经被清掉了
    for (
      let i = realTimeSendTryChunk ? realTimeSendTryChunk.index : 0;
      i < chunk.index;
      i++
    ) {
      buffers[i] = null
    }
    realTimeSendTryChunk = chunk // 此时的chunk.data就是原始的音频16位pcm数据（小端LE），直接保存即为16位pcm文件、加个wav头即为wav文件、丢给mp3编码器转一下码即为mp3文件

    pcm = chunk.data
    pcmSampleRate = chunk.sampleRate

    if (pcmSampleRate !== testSampleRate) {
      // 除非是onProcess给的bufferSampleRate低于testSampleRate
      throw new Error(
        `不应该出现pcm采样率: ${pcmSampleRate}和需要的采样率${testSampleRate}不一致`,
      )
    }
  }

  // 将pcm数据丢进缓冲，凑够一帧发送，缓冲内的数据可能有多帧，循环切分发送
  if (pcm.length > 0) {
    realTimeSendTryChunks.push({ pcm, pcmSampleRate })
  }

  // 从缓冲中切出一帧数据
  const chunkSize = SendFrameSize / (testBitRate / 8) // 8位时需要的采样数和帧大小一致，16位时采样数为帧大小的一半
  const sendPcm = new Int16Array(chunkSize)
  let sendPcmSampleRate = 0
  let pcmOK = false
  let pcmLen = 0

  // eslint-disable-next-line no-labels
  for1: for (let i1 = 0; i1 < realTimeSendTryChunks.length; i1++) {
    const chunk = realTimeSendTryChunks[i1]
    sendPcmSampleRate = chunk.pcmSampleRate

    for (let i2 = chunk.offset || 0; i2 < chunk.pcm.length; i2++) {
      sendPcm[pcmLen] = chunk.pcm[i2]
      pcmLen++

      // 满一帧了，清除已消费掉的缓冲
      if (pcmLen === chunkSize) {
        pcmOK = true
        chunk.offset = i2 + 1
        for (let i3 = 0; i3 < i1; i3++) {
          realTimeSendTryChunks.splice(0, 1)
        }
        // eslint-disable-next-line no-labels
        break for1
      }
    }
  }

  // 缓冲的数据不够一帧时，不发送 或者 是结束了
  if (!pcmOK) {
    if (isClose) {
      const num = ++realTimeSendTryNumber
      TransferUpload(num, null, 0, null, isClose)
    }
    return
  }

  // 16位pcm格式可以不经过mock转码，直接发送new Blob([pcm.buffer],{type:"audio/pcm"}) 但8位的就必须转码，通用起见，均转码处理，pcm转码速度极快
  const num = ++realTimeSendTryNumber
  const encStartTime = Date.now()
  const recMock = Recorder({
    bitRate: testBitRate, // 需要转换成的比特率
    sampleRate: testSampleRate, // 需要转换成的采样率
    type: 'pcm',
  })
  recMock.mock(sendPcm, sendPcmSampleRate)
  recMock.stop((blob: any, duration: any) => {
    blob.encTime = Date.now() - encStartTime

    // 转码好就推入传输
    TransferUpload(num, blob, duration, recMock, false)

    // 循环调用，继续切分缓冲中的数据帧，直到不够一帧
    RealTimeSendPcm([], 0, isClose)
  })
}

// =====数据传输函数==========
function TransferUpload(num: number, blobOrNull: Blob | null, _duration: number, _blobRec: null, isClose: boolean) {
  transferUploadNumberMax = Math.max(transferUploadNumberMax, num)
  if (blobOrNull && onBlobAvailable) {
    onBlobAvailable(blobOrNull)
    //* ********发送方式一：Base64文本发送***************
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   const base64 = (/.+;\s*base64\s*,\s*(.+)$/i.exec(
    //     reader.result as string
    //   ) || [])[1];
    //   // console.log('base64', base64);
    //   // 可以实现
    //   send(base64);
    // };
    // reader.readAsDataURL(blobOrNull);
  }

  if (isClose) {
    console.info('录音结束，传输数据量：', transferUploadNumberMax)
  }
}

// // =====pcm文件合并核心函数==========
// Recorder.PCMMerge = function (fileBytesList, bitRate, sampleRate, True, False) {
//   // 计算所有文件总长度
//   let size = 0;
//   for (var i = 0; i < fileBytesList.length; i++) {
//     size += fileBytesList[i].byteLength;
//   }
//   // 全部直接拼接到一起
//   let fileBytes = new Uint8Array(size);
//   let pos = 0;
//   for (var i = 0; i < fileBytesList.length; i++) {
//     let bytes = fileBytesList[i];
//     fileBytes.set(bytes, pos);
//     pos += bytes.byteLength;
//   }
//   // 计算合并后的总时长
//   let duration = Math.round(((size * 8) / bitRate / sampleRate) * 1000);
//
//   True(fileBytes, duration, { bitRate: bitRate, sampleRate: sampleRate });
// };

// 调用录音
let rec: any

export function recStartPcm(opts: StartOpts) {
  recStart('pcm', opts)
}

export function recStartWav(opts: StartOpts) {
  recStart('wav', opts)
}

function recStart(type: Format, opts: StartOpts) {
  if (opts.blobInterval)
    SendInterval = opts.blobInterval
  if (opts.onBlobAvailable)
    onBlobAvailable = opts.onBlobAvailable
  if (opts.frameSize)
    SendFrameSize = opts.frameSize

  if (rec)
    rec.close() // 先关闭上次的录音，避免录到前面的内容

  rec = Recorder({
    audioTrackSet: {
      autoGainControl: true,
      echoCancellation: true,
      noiseSuppression: true,
    },

    onProcess: (
      buffers: any,
      _powerLevel: any,
      _bufferDuration: any,
      bufferSampleRate: any,
    ) => {
      console.log('onProcess', buffers, bufferSampleRate);
      // 推入实时处理，因为是unknown格式，buffers和rec.buffers是完全相同的（此时采样率为浏览器采集音频的原始采样率），只需清理buffers就能释放内存，其他格式不一定有此特性。
      switch (realTimeSendTryType) {
        case 'wav':
          RealTimeSendWav(buffers, bufferSampleRate, false)
          break
        case 'pcm':
          RealTimeSendPcm(buffers, bufferSampleRate, false)
          break
      }
    },
    type: 'unknown',
  })

  rec.open(
    () => {
      // 打开麦克风授权获得相关资源
      RealTimeSendTryReset(type) // 重置环境，开始录音时必须调用一次
      rec.start() // 开始录音
      opts.onStartOk?.()
    },
    (msg: string, notAllow: boolean) => {
      opts.onStartError?.(msg, notAllow)
    },
  )
}

export function recStop() {
  rec.close() // 直接close掉即可，这个例子不需要获得最终的音频文件
  switch (realTimeSendTryType) {
    case 'wav':
      RealTimeSendWav([], 0, true) // 最后一次发送
      break
    case 'pcm':
      RealTimeSendPcm([], 0, true) // 最后一次发送
      break
  }
}
