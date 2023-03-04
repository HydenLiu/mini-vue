export const enum ShapeFlags {
  /**
   * 逻辑与(&) 用于判断
   * 逻辑或(|) 用于修改值
   */
  ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3, // 1000
  SLOT_CHILDREN = 1 << 4 // 10000 ： slots类型
}
