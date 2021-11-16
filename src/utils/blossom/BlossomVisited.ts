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
    console.log({ node, mate })

    if (!this.currentNode) throw new Error('No current node')

    const nodeTree = this.currentNode.addChild(node)
    const mateTree = nodeTree.addChild(mate)

    this.checkQueue.unshift(mateTree)
  }

  pathToStart() {
    if (!this.currentNode) throw new Error('No current node')

    return this.currentNode.pathToRoot().map((tree) => tree.elem)
  }
}

// const visited = new BlossomVisited('1')

// visited.visitPair('a', 'b')
// visited.moveTo('b')

// console.dir(
//   visited.pathToStart().map((elem) => elem.elem),
//   { depth: 9 }
// )
