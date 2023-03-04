import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup (props) {

  },
  render () {
    const foo = h('p', {}, 'foo')
    console.log(this.$slots);

    // 将函数function -> vnode
    // 使用renderSlots
    // 具名插槽
    // 作用域插槽
    const age = 18
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { age }),
      foo,
      renderSlots(this.$slots, 'footer') // 具名插槽
    ])
  }
}
