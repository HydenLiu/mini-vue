import { generate } from '../codegen'
import { baseParse } from '../parse'
import { transform } from '../transform'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
