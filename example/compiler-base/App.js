import { h, ref } from '../../lib/guide-mini-vue.esm.js'
import Child from './Child.js'

export const App = {
  name: 'App',
  setup () {
    const msg = ref('123')
    const count = ref(1)

    window.msg = msg

    const changeChildProps = () => {
      msg.value = '456'
    }

    const changeCount = () => {
      count.value++
    }

    return { msg, changeChildProps, changeCount, count }
  },
  template: `<div>hello, {{msg}}</div>`
  // template: `<div>
  //   你好， {{ msg }}
  //   <Child msg='xxxx'></Child>
  //   <button onClick='changeCount'>change self count</button>
  //   <p>count: {{ count }}</p>
  // </div>`
}
