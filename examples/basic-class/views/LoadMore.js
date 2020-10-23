import React from 'react'
import { inject } from 'relinx'

const styles = {
  wrapper: {
    width: '100%',
    height: 50,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: '50px',
    backgroundColor: '#5cbd3c',
  },
}

class LoadMore extends React.PureComponent {
  handleClick() {
    const { dispatch } = this.props
    dispatch({
      type: 'init/getGoodsList',
    })
  }

  render() {
    return (
      <div style={styles.wrapper} onClick={this.handleClick}>
        获取更多
      </div>
    )
  }
}

export default inject()(LoadMore)