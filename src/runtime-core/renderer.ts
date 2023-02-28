import { createComponentInstance, setupComponent } from './components'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 组件类型
  processComponent(vnode, container)

  // TODO: element类型
}

function processComponent(vnode: any, container: any) {
  // 挂载组件
  mountComponent(vnode, container)

  // TODO: 更新组件
}

function mountComponent(vnode, container) {
  // 创建一个组件实例对象instance
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render()

  // vnode -> patch
  // vnode -> element -> moundElement

  patch(subTree, container)
}
