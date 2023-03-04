import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  setup () {
    const count = ref(0)
    const msg = ref('hi')

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const onChange = ()=>{
      props.value.foo = undefined
    }

    const onClick = () => {
      count.value++
      msg.value = 'hello'
    }

    return {
      count,
      msg,
      props,
      onClick,
      onChange
    }
  },

  render () {
    return h(
      'div',
      {
        id: 'root',
        ...this.props
      },
      [
        h('div', {}, 'count: ' + this.count),
        h('div', {}, 'msg: ' + this.msg),
        h('button',
          {
            onClick: this.onClick
          },
          'click'
        ),
        h('button',
          {
            onClick: this.onChange
          },
          'change'
        )
      ]
    )
  }
}
