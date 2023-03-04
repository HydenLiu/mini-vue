import { createRenderer } from '../runtime-core'

function createElement(type) {
  console.log('createElement')
  return document.createElement(type)
}

function patchProp(el, key, val) {
  const isOn = (k: string) => /^on[A-Z]/.test(k)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, val)
  } else {
    el.setAttribute(key, val)
  }
}

function insert(el, parent) {
  parent.append(el)
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
})

// 用户开始调用createApp
export function createApp(...args){
  return renderer.createApp(...args)
}

export * from '../runtime-core'
