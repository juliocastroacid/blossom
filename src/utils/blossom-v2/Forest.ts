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

  checkLater(node: Node) {
    this.toCheck.push(node)
  }

  pathToItsRootTree(node: Node) {
    return this.findTreeOrFail(node).pathToRoot(node)
  }

  distanceToItsRootTree(node: Node) {
    return this.findTreeOrFail(node).distanceToRoot(node)
  }

  areConnectable(node1: Node, node2: Node) {
    return (
      this.distanceToItsRootTree(node1) % 2 === 0 && this.distanceToItsRootTree(node2) % 2 === 0
    )
  }

  areInTheSameTree(node1: Node, node2: Node) {
    return this.findTreeOrFail(node1) === this.findTreeOrFail(node2)
  }

  connect(from: Node, to: Node) {
    return [...this.pathToItsRootTree(from).reverse(), ...this.pathToItsRootTree(to)]
  }
}
