export const formatTimestamp = (timestamp: number): string => {
  const timestampInSeconds = Math.floor(timestamp / 1000)

  const minutes = Math.floor((timestampInSeconds % 3600) / 60)
  const seconds = Math.floor(timestampInSeconds % 60)

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')
  return `${formattedMinutes}:${formattedSeconds}`
}
