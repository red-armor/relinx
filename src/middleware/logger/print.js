import { formatTime } from './utils'

const colorLine = Function.apply.bind(console.log, null)
const colorGroupEnd = console.groupEnd
const colorGroupCollapsed = Function.apply.bind(console.groupCollapsed, null)
const isEmptyObject = obj => !obj || Object.keys(obj).length === 0 && obj.constructor === Object

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
  let title

  const nextActions = [].concat(initialActions)

  nextActions.forEach(({ type }) => {
    title = title ? `${title}__${type}` : type
  })

  const parts = []
  parts.push(['action', 'color: #7cb305; font-weight: bold'])
  parts.push([title, 'color: inherit;'])
  parts.push([`@ ${formatTime(startTime)}`, 'color: gray; font-weight: lighter;'])
  parts.push([`(${endTime - startTime}ms)`, 'color: gray; font-weight: lighter;'])

  colorGroupCollapsed(colorLog(parts))
}

const renderSubAction = props => {
  const { type, payload = '', actionType = 'action', flag, style } = props
  const parts = []
  if (flag) {
    parts.push([flag, 'color: #00474f; font-weight: bold'])
  }

  if (type) {
    parts.push([actionType, 'color: #eb2f96; font-weight: bold'])
    parts.push([type, 'color: #722ed1; font-weight: bold'])
  }

  if (style === 'line') {
    colorLine([...colorLog(parts), payload])
  } else {
    colorGroupCollapsed([...colorLog(parts), payload])
  }
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

const paint = (tree, flag) => {
  const { type, actions = {}, effects = {}, payload, actionType } = tree
  const actionKeys = Object.keys(actions)
  const effectKeys = Object.keys(effects)

  if (!actionKeys.length && !effectKeys.length) {
    renderSubAction({ type, payload, actionType, flag, style: 'line' })
  } else {
    renderSubAction({ type, payload, actionType, flag })
  }

  actionKeys.forEach(key => {
    const action = actions[key]
    paint(action)
  })
  effectKeys.forEach(key => {
    const effect = effects[key]
    paint(effect)
  })

  if (actionKeys.length || effectKeys.length) {
    colorGroupEnd()
  }
}

export default props => {
  const {
    prevState = {},
    nextState = {},
    prevTree,
    nextTree,
  } = props

  renderTitle(props)
  paint(prevTree, 'prevTree')
  renderPrevState(prevState)
  paint(nextTree, 'nextTree')
  renderNextState(nextState)
  colorGroupEnd()
}