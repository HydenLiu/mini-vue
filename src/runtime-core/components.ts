import { proxyRefs } from '../reactivity'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { PublicInstanceProxyHandlers } from './componentsPublicInstance'

export function createComponentInstance(vnode, parent) {
  console.log('createComponentInstance', parent)
  const component = {
    vnode,
    type: vnode.type,
    next: null, // 下次要更新的虚拟节点
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {},
  }

  // bind(null, component) 使用了这个，后面用户就可以不用再传instance
  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

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
    setCurrentInstance(instance)
    // setup会返回function 或者 object
    // 这里调用setup方法
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  // 调用编译器方法
  if(compiler && !Component.render){
    if(Component.template){
      Component.render = compiler(Component.template)
    }
  }

  // setup返回函数的话这里调用render方法（h函数构成）
  instance.render = Component.render
}

let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(value) {
  currentInstance = value
}

// 编译时用到
let compiler
export function registerRuntimeCompiler(_compiler){
  compiler = _compiler
}
