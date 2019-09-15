import { formatTime } from './utils'

const colorLine = Function.apply.bind(console.log, null)
const colorGroupCollapsed = Function.apply.bind(console.groupCollapsed, null)
const colorGroupEnd = console.groupEnd

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

const renderTitle = props => {
  const { initialActions, startTime, endTime } = props
  const nextActions = [].concat(initialActions)
  let title
  if ([].concat(initialActions).length === 1) {
    title = nextActions[0].type
  } else {
    title = 'group'
  }

  const parts = []
  parts.push(['action', 'color: gray; font-weight: lighter'])
  parts.push([title, 'color: inherit;'])
  parts.push([`@ ${formatTime(startTime)}`, 'color: gray; font-weight: lighter;'])
  parts.push([`(${endTime - startTime}ms)`, 'color: gray; font-weight: lighter;'])

  colorGroupCollapsed(colorLog(parts))
}

const renderSubAction = action => {
  const { type, payload = {} } = action
  const parts = []
  parts.push(['action', 'color: gray; font-weight: lighter'])
  parts.push([type, 'color: inherit;'])

  colorGroupCollapsed(colorLog(parts))
  renderPayload(payload)
  colorGroupEnd()
}

const renderSubActions = actions => {
  actions.forEach(action => renderSubAction(action))
}

const renderPayload = payload => {
  const parts = []

  const title = 'payload'
  const style = 'color: #4CAF50; font-weight: bold'

  parts.push([title, style])
  colorLine([...colorLog(parts), payload])
}

const renderState = (state, isNextState) => {
  const parts = []

  let title = 'prevState'
  let style = 'color: #9E9E9E; font-weight: bold'

  if (isNextState) {
    title = 'nextState'
    style = 'color: #4CAF50; font-weight: bold'
  }

  parts.push([title, style])
  colorLine([...colorLog(parts), state])
}

const renderPrevState = state => {
  renderState(state)
}

const renderNextState = state => {
  renderState(state, true)
}

export default props => {
  const {
    prevState = {},
    nextState = {},
    initialActions = [],
  } = props

  const nextActions = [].concat(initialActions)

  if (nextState.length === 1) {
    renderTitle(props)
    renderPrevState(prevState)
    renderSubAction(initialActions)
    renderNextState(nextState)
    colorGroupEnd()
  } else {
    renderTitle(props)
    renderPrevState(prevState)
    renderSubActions(nextActions)
    renderNextState(nextState)
    colorGroupEnd()
  }
}