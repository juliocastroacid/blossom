import { Tree } from './Tree'

export class BlossomVisited extends Tree<string> {
  private currentNode: Tree<string> | undefined

  private readonly checkQueue: Tree<string>[]

  constructor(start: string) {
    super({ parent: null, elem: start, children: [] })

    this.checkQueue = [this]
  }

  dequeueNodeToCheck() {
    this.currentNode = this.checkQueue.shift()

    return this.currentNode?.elem
  }

  visitPair(node: string, mate: string) {
    if (!this.currentNode) throw new Error('No current node')

    const nodeTree = this.currentNode.addChild(node)
    const mateTree = nodeTree.addChild(mate)

    this.checkQueue.unshift(mateTree)
  }

  findCycle(node1: string, node2: string) {
    const tree1 = this.findOrFail(node1)
    const tree2 = this.findOrFail(node2)

    const node1RootPath = tree1.pathToRoot().map((tree) => tree.elem)
    const node2RootPath = tree2.pathToRoot().map((tree) => tree.elem)

    const intersection = node1RootPath.filter((node) => node2RootPath.includes(node))
    const [pivot] = intersection

    const pivotIndexInNode1RootPath = node1RootPath.findIndex((node) => node === pivot)
    const pivotIndexInNode2RootPath = node2RootPath.findIndex((node) => node === pivot)

    return [
      ...node1RootPath.slice(0, pivotIndexInNode1RootPath),
      pivot,
      ...node2RootPath.slice(0, pivotIndexInNode2RootPath).reverse(),
    ]
  }

  pathToStart() {
    if (!this.currentNode) throw new Error('No current node')

    return this.currentNode.pathToRoot().map((tree) => tree.elem)
  }
}