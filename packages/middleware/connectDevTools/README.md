ConnectDevTools
===================
relinx可视化debugger中间件，连接debugger

## Usage

```javascript
import { createStore, applyMiddleware, connectDevTools } from 'relinx'

const store = createStore(configs, applyMiddleware(connectDevTools))
```
打开下面👇调试连接，即可享受飞一般的调试体验

[调试连接](http://remotedev.io/local)