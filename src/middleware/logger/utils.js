export const Timer = performance || Date

const padding = (value, padding = 2) => `00${value}`.slice(-padding)

export const formatTime = d => {
  const date = new Date(d)
  const hh = date.getHours()
  const mm = date.getMinutes()
  const ss = date.getSeconds()
  const ms = date.getMilliseconds()

  return `${padding(hh)}:${padding(mm)}:${padding(ss)}.${padding(ms, 3)}`
}