type TreeConstructor<T> = {
  parent: Tree<T> | null
  elem: T
  children: Tree<T>[]
}

export class Tree<T> {
  public readonly parent: Tree<T> | null

  public readonly elem: T

  public readonly children: Tree<T>[]

  constructor(p: TreeConstructor<T>) {
    this.parent = p.parent
    this.elem = p.elem
    this.children = p.children
  }

  static withRoot<T>(root: T) {
    return new Tree<T>({
      parent: null,
      elem: root,
      children: [],
    })
  }

  addChild(elem: T) {
    if (this.has(elem)) throw new Error(`Elem ${elem} is already added`)

    const node = new Tree<T>({
      parent: this,
      elem,
      children: [],
    })

    this.children.push(node)

    return node
  }

  removeChild(elem: T) {
    const elemIndex = this.children.findIndex((child) => child.elem === elem)

    const elemNode = this.children[elemIndex]

    this.children.splice(elemIndex, 1)

    return elemNode
  }

  pathToRoot() {
    let currentNode: Tree<T> | null = this
    const path = []

    while (currentNode) {
      path.push(currentNode)

      currentNode = currentNode.parent
    }

    return path
  }

  find(elem: T): Tree<T> | undefined {
    if (elem === this.elem) return this

    for (const child of this.children) {
      const found = child.find(elem)

      if (found) return found
    }

    return undefined
  }

  findOrFail(elem: T): Tree<T> {
    const tree = this.find(elem)

    if (!tree) throw new Error(`Elem ${elem} was not found`)

    return tree
  }

  has(elem: T) {
    return Boolean(this.find(elem))
  }
}
