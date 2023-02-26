import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: any
  private _dirty = true // 是否需要缓存
  private _value // 保存缓存之前的值
  private _effect
  constructor(getter) {
    this._getter = getter

    // 依赖处理
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) this._dirty = true
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
