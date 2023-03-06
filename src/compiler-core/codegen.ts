import { isString } from '../shared'
import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING,
} from './runtimeHelpers'

export function generate(ast) {
  // 生成render函数形式的字符串
  const context = createCodegenContext()
  const { push } = context

  // push(`const {toDisplayString: _toDisplayString } = Vue`)
  genFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}){`)
  push(`return `)

  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code,
  }
}

function genFunctionPreamble(ast: any, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

// 将code放到上下文context，文件全局可以访问
function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    },
  }

  return context
}

// 生成节点
function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPERSSION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      getCompoundExpression(node, context)
      break
    default:
      break
  }
}

// 生成文本节点
function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}

// 生成插值节点
function genInterpolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

// 生成表达式
function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}

// 生成元素节点
function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, props, children]), context)
  // genNode(children, context)
  push(')')
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }

    if(i < nodes.length - 1){
      push(', ')
    }
  }
}

function genNullable(args) {
  return args.map((arg) => arg || 'null')
}

// 生成复合类型
function getCompoundExpression(node, context) {
  const children = node.children
  const { push } = context

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}
