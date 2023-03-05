import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './components'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null, null)
  }

  // n1 -> 老虚拟节点； n2 -> 新的虚拟节点
  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element类型
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件类型
          processComponent(n1, n2, container, parentComponent, anchor)
        }
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    // 处理element上面的props
    patchProps(el, oldProps, newProps)

    // 处理element上面的children
    patchChildren(n1, n2, el, parentComponent, anchor)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const shapeFlag = n2.shapeFlag
    const c2 = n2.children

    /**
     * 如果新节点是文本，老节点是数组，则清空老children， 然后设置文本
     * 如果新节点是文本，老节点也是文本，则判断是否相等，不相等替换
     * */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 清空
        umountChildren(n1.children)
        // 设置text
        hostSetElementText(container, c2)
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      /**
       * 如果新节点是数组，老节点是文本，则清空文本，设置添加children
       */
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // diff: 数组和数组的情况
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSomeVNodeType(n1, n2) {
      // 判断相同节点的条件，type和key都相同
      return n1.type === n2.type && n1.key === n2.key
    }

    // 1、左侧对比，例如 n2: [a,b,c]、 n1: [a,b,d,e]
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 2、右侧对比, 例如 n2: [a,b,c]、 n1: [d,e,b,c]
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 3、新的节点比老的多 -> 创建, 例如 n2: [a,b,c]、 n1: [b,c]/[a,b]
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 4、新的节点比老的少 -> 删除, 例如 n2: [b,c]/[a,b]、 n1: [a,b,c]
      while (i <= e2) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 5，中间不同的进行对比，例如：n2: [a,b,c,d,f,g]、 n1: [a,b,e,c,f,g]
      let s1 = i
      let s2 = i

      const toBePatched = e2 - s1 + 1
      let patched = 0
      // 初始化映射表，先赋值为0
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      let moved = false // 是否需要移动（使用最长递增子序列）
      let maxNewIndexSoFar = 0

      // 获取新节点的key对应的下标map
      const keyToNewIndexMap = new Map()
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        // patche的个数大于等于新节点要更新的总数量的话，把后面的节点直接移除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          container
        }

        let newIndex
        // 判断老节点在新节点上有没有，有的话直接拿下标，没有的话遍历新节点获取下标
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = 0; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        // 如果最终没有获取到下标的话则移除，有的话patch子节点
        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1 // 加一是为了避免为0的情况，为0表示没有关联映射表
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          // patch完之后记录个数
          patched++
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      let j = increasingNewIndexSequence.length - 1 // 最长递增子序列的指针
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        if (newIndexToOldIndexMap[i] === 0) {
          // 创建新节点
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          // 移动位置
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function umountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        // 老节点在没有了，要遍历老节点进行删除
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type))

    const { props, children, shapeFlag } = vnode

    // props
    if (props) {
      for (const key in props) {
        const val = props[key]
        hostPatchProp(el, key, null, val)
      }
    }

    // children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    // container.append(el)
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    // 创建一个组件实例对象instance
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ))
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    instance.update = effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))

        // vnode -> patch
        // vnode -> element -> moundElement
        patch(null, subTree, container, instance, anchor)

        // $el
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }

        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree

        // 记得更新instance里面的subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}

function updateComponentPreRender(instance: any, nextVNode: any) {
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
// 最长递增子序列算法
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
