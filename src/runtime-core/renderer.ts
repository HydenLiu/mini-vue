import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './components'
import { Fragment } from './vnode'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  const { shapeFlag, type } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element类型
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 组件类型
        processComponent(vnode, container)
      }
  }
}

function processFragment(vnode, container){
  mountChildren(vnode, container)
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))

  const { props, children, shapeFlag } = vnode
  if (props) {
    for (const key in props) {
      const val = props[key]
      const isOn = (k: string) => /^on[A-Z]/.test(k)
      if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, val)
      } else {
        el.setAttribute(key, val)
      }
    }
  }

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> moundElement
  patch(subTree, container)

  // $el
  initialVNode.el = subTree.el
}
