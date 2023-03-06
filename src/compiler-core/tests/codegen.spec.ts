import { generate } from '../codegen'
import { baseParse } from '../parse'
import { transform } from '../transform'
import { transformElement } from '../transforms/transformElements'
import { tranformExpression } from '../transforms/transformExpression'
import { transformText } from '../transforms/transformText'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast, {
      nodeTransforms: [tranformExpression],
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast = baseParse('<div>hi, {{message}}</div>')
    transform(ast, {
      nodeTransforms: [tranformExpression, transformElement, transformText],
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
