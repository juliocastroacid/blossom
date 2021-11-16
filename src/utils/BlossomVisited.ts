import { Tree } from './Tree'

export class BlossomVisited extends Tree<string> {
  private currentNode: Tree<string>

  constructor(start: string) {
    super({ parent: null, elem: start, children: [] })

    this.currentNode = this
  }

  visitPair(node: string, mate: string) {
    const nodeTree = this.currentNode.addChild(node)

    nodeTree.addChild(mate)
  }

  moveTo(node: string) {
    const nodeTree = this.find(node)

    if (!nodeTree) throw new Error(`No node was found for ${node}`)

    this.currentNode = nodeTree
  }

  pathToStart() {
    return this.currentNode.pathToRoot()
  }
}

const visited = new BlossomVisited('1')

visited.visitPair('a', 'b')
visited.moveTo('b')

console.dir(
  visited.pathToStart().map((elem) => elem.elem),
  { depth: 9 }
)
