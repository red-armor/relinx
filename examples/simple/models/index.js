import counterWithObserveItem from '../views/counter-with-observe-item/model'
import counterWithoutObserveItem from '../views/counter-without-observe-item/model'

export default () => ({
  counterWithObserveItem: new counterWithObserveItem(),
  counterWithoutObserveItem: new counterWithoutObserveItem(),
})