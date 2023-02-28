import { render } from "./renderer"
import { createVNode } from "./vnode"

//  rootComponent: 根组件
export function createApp(rootComponent) {
  return {
    // rootContainer: 根容器
    mount(rootContainer) {
      // component -> vnode
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    },

  }
}
