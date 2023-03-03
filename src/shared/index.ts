export const extend = Object.assign

export const isObject = (value)=>{
  return value !== null && typeof value === 'object'
}

export const hasChange = (value, newValue)=> {
  return !Object.is(value, newValue)
}

export const hasOwn = (val, key)=> Object.prototype.hasOwnProperty.call(val, key)

const capitalliza = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandleKey = (str: string) => {
  return str ? 'on' + capitalliza(str) : ''
}

export const camelize = (str: string)=>{
  return str.replace(/-(\w)/g, (_, c: string)=>{
    return c ? c.toUpperCase() : ''
  })
}
