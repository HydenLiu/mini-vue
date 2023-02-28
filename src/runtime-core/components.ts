import { PublicInstanceProxyHandlers } from './componentsPublicInstance'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  }

  return component
}

export function setupComponent(instance) {
  // initProps()
  // initSlots()

  // 调用组件的setup方法
  setupStatefulComponent(instance)
}

// 组件初始化的时候
function setupStatefulComponent(instance: any) {
  const Component = instance.type

  // 第一个参数里面传instance, 然后在PublicInstanceProxyHandlers里面可以拿到
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    // 返回function 或者 object
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  instance.render = Component.render
}
