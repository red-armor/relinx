import print from "./print"

export default ({getState}) => next => actions => {
	const startTime = Date.now()
	const prevState = JSON.parse(JSON.stringify(getState()))

	next(actions)

	const endTime = Date.now()

	print({
		actions,
		prevState,
		initialActions: actions,
		startTime,
		endTime
	})
}

// 结束的时间点。。。
// 如果同步的reducers的话，最外层运行结束就是一个结点
// 如果说是一个effect的话，这个时候会有很多的不确定性。或者同样是以外层结束作为一个结点；
// 然后每一次有sub结束完就搞一次；最终的结论就是一个action可能会有多个的log
