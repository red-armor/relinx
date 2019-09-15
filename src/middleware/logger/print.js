import { formatTime, elapsedTime } from './utils'

const groupLogger = Function.apply.bind(console.group, null)

const renderTitle = props => {
  const { initialActions, startTime, endTime } = props
  const firstAction = [].concat(initialActions)[0]
  const { type } = firstAction

  const parts = []
  parts.push(['action', 'color: gray; font-weight: lighter'])
  parts.push([type, 'color: inherit;'])
  parts.push([`@ ${formatTime(startTime)}`, 'color: gray; font-weight: lighter;'])
  parts.push([`(${endTime - startTime}ms)`, 'color: gray; font-weight: lighter;'])

  groupLogger(colorLog(parts))
}

const colorLog = group => {
  const { text, styles } = group.reduce((acc, cur) => {
    const { text, styles } = acc
    const [subText, subStyle] = cur

    return {
      text: `${text}%c ${subText}`,
      styles: [].concat(styles, subStyle)
    }
  }, {
    text: '',
    styles: [],
  })

  return [text, ...styles]
}

export default props => {
  const {
    startTime,
    endTime,
    prevState = {},
    nextState = {},
    initialActions = [],
    actionGroup = [],
  } = props

  renderTitle(props)
}