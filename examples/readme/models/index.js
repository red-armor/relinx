import createAppModel from "../container/model"
import createInfoModel from '../views/info/model'

export default () => ({
  app: createAppModel(),
  info: createInfoModel(),
})
