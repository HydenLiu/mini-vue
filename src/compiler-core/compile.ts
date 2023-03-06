import { generate } from './codegen'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms/transformElements'
import { tranformExpression } from './transforms/transformExpression'
import { transformText } from './transforms/transformText'

export function baseCompile(template) {
  const ast = baseParse(template)
  transform(ast, {
    nodeTransforms: [tranformExpression, transformElement, transformText],
  })
  return generate(ast)
}
