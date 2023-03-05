export function generate(ast) {
  // 生成render函数形式的字符串
  const context = createCodegenContext()
  const {push} = context
  push('return ')

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}){`)
  push(`return `)

  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

// 将code放到上下文context，文件全局可以访问
function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
  }

  return context
}

function genNode(node, context){
  const {push} = context
  push(`'${node.content}'`)
}







