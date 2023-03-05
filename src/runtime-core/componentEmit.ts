import { camelize, toHandleKey } from "../shared/index"

export function emit(instance, event, ...args) {
  // instance.props -> event
  // 例如：add -> onAdd 或者 add-foo -> onAddFoo
  const { props } = instance

  

  const handleName = toHandleKey(camelize(event))
  const hander = props[handleName]
  hander && hander(...args)
}
 