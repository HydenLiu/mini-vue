import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, ''))
}

function parseChildren(context, parentTag) {
  const nodes: any = []

  while (!isEnd(context, parentTag)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      // 处理 {{message}}
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      // 处理element标签
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context)
      }
    }

    // 处理Text类型
    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  return nodes
}

function isEnd(context, parentTag) {
  // 当遇到结束标签的时候
  const s = context.source
  if (parentTag && s.startsWith(`</${parentTag}>`)) {
    return true
  }

  // 当source没有值的时候

  return !s
}

function parseText(context) {
  // 处理Text节点时，遇到'{{'停止截取
  let endIndex = context.source.length
  let endToken = '{{'

  const index = context.source.indexOf(endToken)
  if (index !== -1) {
    endIndex = index
  }

  const content = paseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseElement(context: any) {
  const element: any = parseTag(context, TagType.Start)
  element.children = parseChildren(context, element.tag)
  parseTag(context, TagType.End)
  return element
}

function parseTag(context, type: TagType) {
  // 1. 解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]

  // 2. 删除处理完成的代码
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === TagType.End) return

  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function parseInterpolation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = paseTextData(context, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, closeDelimiter.length)
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPERSSION,
      content,
    },
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function paseTextData(context: any, length) {
  // 1. 获取content
  const content = context.source.slice(0, length)

  // 2. 推进 删除处理完成的代码
  advanceBy(context, length)
  return content
}

function createRoot(children) {
  return {
    children,
  }
}

function createParserContext(content: string): any {
  return {
    source: content,
  }
}
