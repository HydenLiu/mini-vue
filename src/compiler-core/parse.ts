import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: any = []

  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith('{{')) {
      // 处理 {{message}}
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      // 处理element标签
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
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

function isEnd(context, ancestors) {
  // 当遇到结束标签的时候
  const s = context.source
  // </div>
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }

  // 当source没有值的时候
  return !s
}

// 处理Text类型
function parseText(context) {
  // 处理Text节点时，遇到'{{'停止截取
  let endIndex = context.source.length
  let endTokens = ['<', '{{']

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = paseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

// 处理element标签
function parseElement(context: any, ancestors) {
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签：${element.tag}`)
  }
  return element
}

function startsWithEndTagOpen(source, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
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

// 处理插值
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

// 删除处理完成的代码
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

// 截取文本
function paseTextData(context: any, length) {
  // 1. 获取content
  const content = context.source.slice(0, length)

  // 2. 推进 删除处理完成的代码
  advanceBy(context, length)
  return content
}

// 创建根节点
function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT,
  }
}

// 创建上下文
function createParserContext(content: string): any {
  return {
    source: content,
  }
}
