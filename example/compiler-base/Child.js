import { h } from '../../lib/guide-mini-vue.esm.js'

export default {
  name: 'Child',
  setup (props, { emit }) { },
  template: `<div>
    <div>child-props-msg: {{msg}}</div>
  </div>`
}
