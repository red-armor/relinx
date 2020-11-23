import React from 'react'
import { inject } from 'relinx'
import GoodsItem from './GoodsItem'

const spanStyle = {
  position: 'absolute',
  top: 0,
  left: '20px',
  color: 'red',
}

class GoodsView extends React.PureComponent {
  constructor(props)  {
    super(props)
    this.updateCount = 0
  }

  componentDidUpdate() {
    this.updateCount += 1
  }

  render() {
    const { listData, listLength } = this.props.state

    return (
      <div>
        <span style={spanStyle}>
          {`view update ${this.updateCount}, length ${listLength}`}
        </span>
        {listData.map((data, key) => (
          <GoodsItem
            key={key}
            data={data}
          />
        ))}
      </div>
    )
  }
}

export default inject('goods')(GoodsView)
