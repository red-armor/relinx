import React from 'react'
import ReactDOM from 'react-dom'
import Produce from './produce'
import Reaction from './reaction'
import BailResult from './bailResult'
import Equal from './equal'
import Nest from './nest'

const Basic = () => {
  return (
    <React.Fragment>
      {/* <Produce />
      <Reaction /> */}
      {/* <BailResult /> */}
      {/* <Equal /> */}
      <Nest />
    </React.Fragment>
  )
}

ReactDOM.render(<Basic />, document.getElementById('app'))
