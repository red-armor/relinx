import React from 'react'
import { inject } from 'relinx'

const styles = {
  container: {
    height: 50,
    padding: 15,
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    position: 'relative',
  },
  title: {
    fontSize: 16,
    lineHeight: '20px',
    color: 'rgb(23, 171, 37)',
  },
  counter: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 90,
    bottom: 0,
  },
  addon: {
    fontSize: 16,
    lineHeight: '20px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    marginTop: '10px',
    outline: 0,
  },
  itemCount: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: 16,
    width: 15,
    display: 'inline-block',
    textAlign: 'center',
  },
  span: {
    color: 'grey',
    marginLeft: '20px',
  }
}

class GoodsItem extends React.PureComponent {
  constructor(props) {
    super(props)
    this.updateCount = 0
  }

  componentDidUpdate() {
    this.updateCount += 1
  }

  increment() {
    const { data: { id }, index, dispatch } = this.props
    dispatch({
      type: 'goods/increment',
      payload: { id, index },
    })
  }

  decrement() {
    const { data: { id }, index, dispatch } = this.props
    dispatch({
      type: 'goods/decrement',
      payload: { id, index },
    })
  }

  render() {
    const { data: { count, title }} = this.props

    return (
      <div style={styles.container}>

        <span style={styles.title}>{title}</span>

        <span style={styles.span}>
          {`(item update ${this.updateCount})`}
        </span>

        <div style={styles.counter}>
          <button style={styles.addon} onClick={this.increment.bind(this)}>+</button>
          <span style={styles.itemCount}>{count}</span>
          <button style={styles.addon} onClick={this.decrement.bind(this)}>-</button>
        </div>
      </div>
    )
  }
}

export default inject()(GoodsItem)