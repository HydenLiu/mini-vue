import {
  mutableHandles,
  readonlyHandles,
  shallowReadonlyHandlers,
} from './baseHandles'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandles)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandles)
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(raw) {
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw) {
  return !!raw[ReactiveFlags.IS_READONLY]
}

export function isProxy(raw) {
  return isReactive(raw) || isReadonly(raw)
}

function createReactiveObject(raw, handle) {
  return new Proxy(raw, handle)
}
