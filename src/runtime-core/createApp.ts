import { createVNode } from "./vnode"

//  rootComponent: 根组件
export function createAppAPI(render){
  return function createApp(rootComponent) {
    return {
      // rootContainer: 根容器
      mount(rootContainer) {
        // component -> vnode
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      },
  
    }
  }

}
