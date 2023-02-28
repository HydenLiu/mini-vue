import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const App = {
  render () {
    window.self = this
    return h('div', {
      id: 'root'
    },
      `hi ${this.msg}`
      // [h('p', null, 'hi'), h('p', { class: 'red' }, 'vue')]
    )
  },

  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
