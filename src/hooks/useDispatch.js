import {useContext} from "react"
import context from "../context"

export default () => {
	const {dispatch} = useContext(context)
	return [dispatch]
}
