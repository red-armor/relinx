import React, { useRef } from 'react'
import { inject } from 'relinx'
import GoodsItem from '../components/GoodsItem'

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
    const { listData, bottomBarUpdateCount, listLength } = this.props.state

    return (
      <div>
        <span style={spanStyle}>
          {`view update ${this.updateCount}, bottomBarUpdate ${bottomBarUpdateCount}, length ${listLength}`}
        </span>
        {listData.map((data, key) => (
          <GoodsItem
            key={key}
            data={data}
            index={key}
          />
        ))}
      </div>
    )
  }
}

export default inject('goods')(GoodsView)