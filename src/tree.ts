export interface Tree<T> {
  value: T
  forest: Forest<T>
}

export interface Forest<T> extends ReadonlyArray<Tree<T>> {}

export function tree<T>(value: T, forest?: Forest<T>): Tree<T> {
  return { value, forest: forest ?? ([] as Forest<T>) }
}

export function depth<T, U>(
  tree: Tree<T>,
  reducer: (accu: U, curr: T) => U,
  accu: U
): U {
  accu = reducer(accu, tree.value)

  for (const item of tree.forest) {
    accu = depth(item, reducer, accu)
  }

  return accu
}

export function breadth<T, U>(
  tree: Tree<T>,
  reducer: (accu: U, curr: T) => U,
  accu: U
): U {
  accu = reducer(accu, tree.value)

  const buffer = [...tree.forest]

  while (buffer.length > 0) {
    const item = buffer.splice(0, 1)[0]
    accu = reducer(accu, item.value)
    buffer.push(...item.forest)
  }

  return accu
}
