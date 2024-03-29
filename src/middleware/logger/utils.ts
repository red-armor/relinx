const padding = (value: number, paddingCount = 2) =>
  `00${value}`.slice(-paddingCount);

export const formatTime = (d: number) => {
  const date = new Date(d);
  const hh = date.getHours();
  const mm = date.getMinutes();
  const ss = date.getSeconds();
  const ms = date.getMilliseconds();

  return `${padding(hh)}:${padding(mm)}:${padding(ss)}.${padding(ms, 3)}`;
};
