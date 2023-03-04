import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './components'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options

  function render(vnode, container) {
    // patch
    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent) {
    const { shapeFlag, type } = vnode

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element类型
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件类型
          processComponent(vnode, container, parentComponent)
        }
    }
  }

  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent)
  }

  function processText(vnode, container) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))

    const { props, children, shapeFlag } = vnode
    if (props) {
      for (const key in props) {
        const val = props[key]

        hostPatchProp(el, key, val)
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(vnode, el, parentComponent) {
    vnode.children.forEach((v) => {
      patch(v, el, parentComponent)
    })
  }

  function processComponent(vnode: any, container, parentComponent) {
    // 挂载组件
    mountComponent(vnode, container, parentComponent)

    // TODO: 更新组件
  }

  function mountComponent(initialVNode, container, parentComponent) {
    // 创建一个组件实例对象instance
    const instance = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)

    // vnode -> patch
    // vnode -> element -> moundElement
    patch(subTree, container, instance)

    // $el
    initialVNode.el = subTree.el
  }

  return {
    createApp: createAppAPI(render),
  }
}
