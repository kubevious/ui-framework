import { useReducer } from "react"

const forceUpdateReducer = (i: number) => i + 1;

export const useForceUpdate = () => {
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)
  return forceUpdate
}