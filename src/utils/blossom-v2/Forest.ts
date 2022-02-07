import { Tree } from './Tree'
import { Node } from './Node'

type ForestConstructor = {
  trees: Tree[]
  toCheck: Node[]
}

export class Forest {
  private readonly trees: Tree[]

  private readonly toCheck: Node[]

  constructor(p: ForestConstructor) {
    this.trees = p.trees
    this.toCheck = p.toCheck
  }

  static fromRoots(roots: Node[]) {
    const trees = roots.map((root) => Tree.withRoot(root))

    return new Forest({ trees, toCheck: roots })
  }

  pickNextToCheck(): Node | undefined {
    return this.toCheck.shift()
  }

  checkLater(node: Node) {
    this.toCheck.push(node)
  }

  findTreeOf(node: Node) {
    return this.trees.find((tree) => tree.has(node))
  }

  findTreeOrFail(node: Node) {
    const found = this.findTreeOf(node)

    if (!found) throw new Error(`Node ${node} was not found in the forest`)

    return found
  }

  has(node: Node) {
    return Boolean(this.findTreeOf(node))
  }

  pathToItsRootTree(node: Node) {
    return this.findTreeOrFail(node).pathToRoot(node)
  }

  distanceToItsRootTree(node: Node) {
    return this.findTreeOrFail(node).distanceToRoot(node)
  }

  areInTheSameTree(node1: Node, node2: Node) {
    return this.findTreeOrFail(node1) === this.findTreeOrFail(node2)
  }
}
