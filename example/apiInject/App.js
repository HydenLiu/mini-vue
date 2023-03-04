import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup () {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render () {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'Provider',
  setup () {
    provide('foo', 'fooTwoVal')
    const foo = inject('foo')
    // provide('bar', 'barVal')
    return { foo }
  },
  render () {
    return h('div', {}, [h('p', {}, 'ProviderTwo: ' + this.foo), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup () {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'bazDefult') // inject添加默认值
    const bazFn = inject('baz', ()=> 'bazDefultFn') // inject添加默认值函数

    return {
      foo,
      bar,
      baz,
      bazFn
    }
  },
  render () {
    return h('div', {}, `Consumer: - ${this.foo}, ${this.bar}, ${this.baz}, ${this.bazFn}`)
  }
}

export const App = {
  name: 'App',
  setup () { },
  render () {
    return h('div', {}, [h('p', {}, 'ApiInject'), h(Provider)])
  },
}
