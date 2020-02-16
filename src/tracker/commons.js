const toString = Function.call.bind(Object.prototype.toString)
const ownKeys = o =>
	Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o))

export const emptyFunction = () => {}
export const isObject = o =>
	o ? typeof o === "object" || typeof o === "function" : false // eslint-disable-line
export const hasSymbol = typeof Symbol !== "undefined"
export const TRACKER = hasSymbol ? Symbol("tracker") : "__tracker__"

export const canIUseProxy = () => {
	try {
		new Proxy({}, {}) // eslint-disable-line
	} catch (err) {
		return false
	}

	return true
}

export const hasOwnProperty = (o, prop) => o.hasOwnProperty(prop) // eslint-disable-line

export const isTrackable = o => {
	// eslint-disable-line
	return ["[object Object]", "[object Array]"].indexOf(toString(o)) !== -1
}

export function each(obj, iter) {
	if (Array.isArray(obj)) {
		obj.forEach((entry, index) => iter(index, entry, obj))
	} else if (isObject(obj)) {
		Reflect.ownKeys(obj).forEach(key => iter(key, obj[key], obj))
	}
}

export const Type = {
	Object: "object",
	Array: "array"
}

export function shallowCopy(o) {
	if (Array.isArray(o)) return o.slice()
	const value = Object.create(Object.getPrototypeOf(o))
	ownKeys(o).forEach(key => {
		value[key] = o[key]
	})

	return value
}

export const inherit = (subClass, superClass) => {
	subClass.prototype = Object.create(superClass.prototype)
	subClass.prototype.constructor = subClass
	subClass.__proto__ = superClass // eslint-disable-line
}

export const createHiddenProperty = (target, prop, value) => {
	Object.defineProperty(target, prop, {
		value,
		enumerable: false,
		writable: true
	})
}

export const hideProperty = (target, prop) => {
	Object.defineProperty(target, prop, {
		enumerable: false,
		configurable: false
	})
}
