import { hasOwn } from "../shared/index"

const publicPropertiesMap = {
  '$el': (i)=> i.vnode.el
}

// 这里一般处理挂载到template 或者是 h函数里面的
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)){
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if(publicGetter){
      return publicGetter(instance)
    }
  },
}
