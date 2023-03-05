/**
 * 创建一个队列， 然后将渲染任务加入队列中，然后在最后微任务中统一执行
 */
const queue: any[] = []
let isFlushPending = false // 优化点：不能每次都创建promise，所以加一个判断
export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }

  queueFlush()
}

function queueFlush() {
  if (isFlushPending) return
  isFlushPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false
  let job
  while ((job = queue.shift())) {
    job && job()
  }
}

const p = Promise.resolve()
export function nextTick(fn) {
  return fn ? p.then(fn) : p
}
