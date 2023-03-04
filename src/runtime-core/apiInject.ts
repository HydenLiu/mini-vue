import { getCurrentInstance } from './components'

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides

    // 如果下面这两个相等，说明是初始化的状态，创建一次就行
    if (provides === parentProvides) {
      // 将当前的provides指向父级，使用原型链的原理，如果父级没有找到provides，就继续往上找
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}
export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance()

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides

    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
