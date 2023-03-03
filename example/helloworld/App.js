import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  render () {
    window.self = this
    return h('div', {
      id: 'root',
      onClick: () => {
        // console.log('click')
      }
    },
      // `hi ${this.msg}`
      [
        h('p', {}, 'hi'),
        h(Foo, {
          count: 1,
          onAdd (a, b) {
            console.log('onAdd', a, b)
          },
          onAddFoo(){
            console.log('add foo')
          }
        })
      ]
    )
  },

  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}
