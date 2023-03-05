import { ref, h } from '../../lib/guide-mini-vue.esm.js'

const nextChildren = 'newChildren'
const nextChildren2 = [
  h('div', { key: 'a' }, 'a'),
  h('div', { key: 'b' }, 'b'),
  h('div', { key: 'd' }, 'd'),
  h('div', { key: 'c' }, 'c'),
  h('div', { key: 'y' }, 'y'),
  h('div', { key: 'e' }, 'e'),
  h('div', { key: 'f' }, 'f'),
  h('div', { key: 'g' }, 'g'),
]
const prevChildren = [
  h('div', { key: 'a' }, 'a'),
  h('div', { key: 'b' }, 'b'),
  h('div', { key: 'c' }, 'c'),
  h('div', { key: '' }, 'D'),
]
const prevChildren1 = [
  h('div', { key: 'a' }, 'a'),
  h('div', { key: 'b' }, 'b'),
  h('div', { key: 'c' }, 'c'),
  h('div', { key: 'd' }, 'd'),
  h('div', { key: 'e' }, 'e'),
  h('div', { key: 'z' }, 'z'),
  h('div', { key: 'f' }, 'f'),
  h('div', { key: 'g' }, 'g'),
]
const prevChildren2 = 'oldChildren'

export default {
  name: 'Text',
  setup () {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange
    }
  },

  render () {
    const self = this

    return self.isChange === true
      ? h('div', {}, nextChildren2)
      : h('div', {}, prevChildren1)
  }
}

