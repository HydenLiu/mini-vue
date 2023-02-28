import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './components'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  console.log(vnode)
  if (typeof vnode.type === 'string') {
    // element类型
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // 组件类型
    processComponent(vnode, container)
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))

  const { props, children } = vnode
  if (props) {
    for (const key in props) {
      el!.setAttribute(key, props[key])
    }
  }

  if (typeof children === 'string') {
    el!.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }

  container.append(el)
}

function mountChildren(vnode, el) {
  vnode.children.forEach((v) => {
    patch(v, el)
  })
}

function processComponent(vnode: any, container: any) {
  // 挂载组件
  mountComponent(vnode, container)

  // TODO: 更新组件
}

function mountComponent(initialVNode, container) {
  // 创建一个组件实例对象instance
  const instance = createComponentInstance(initialVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode,  container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> moundElement 
  patch(subTree, container)
  
  // $el 
  initialVNode.el = subTree.el
}
