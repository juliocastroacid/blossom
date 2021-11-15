import { UndirectedGraph } from 'graphology'

type BlossomNodeAttributes = {
  x: number
  y: number
  size: number
  label: string
  isPaired: boolean
}

type BlossomEdgeAttributes = {
  isPaired: boolean
}

export class BlossomGraph extends UndirectedGraph<BlossomNodeAttributes, BlossomEdgeAttributes> {
  private static Tree = class extends BlossomGraph {
    private readonly origin: BlossomGraph

    private readonly root: string

    private readonly checkQueue: string[]

    constructor(readonly p: { root: string; source: BlossomGraph }) {
      super()
      this.root = p.root
      this.origin = p.source

      this.copyNode(p.root)
      this.checkQueue = [p.root]
    }

    visitPairedNode(currentNode: string, visitedPairedNode: string) {
      const pairedMate = this.origin.getMate(visitedPairedNode)

      this.copyNode(visitedPairedNode)
      this.copyNode(pairedMate)

      this.copyEdge(currentNode, visitedPairedNode)
      this.copyEdge(visitedPairedNode, pairedMate)

      this.checkQueue.unshift(pairedMate)
    }

    private copyNode(node: string) {
      this.addNode(node)

      this.replaceNodeAttributes(node, this.origin.getNodeAttributes(node))
    }

    private copyEdge(node1: string, node2: string) {
      const edge = this.addEdge(node1, node2)

      this.replaceEdgeAttributes(
        edge,
        this.origin.getEdgeAttributes(this.origin.edge(node1, node2))
      )
    }

    dequeueNodeToCheck() {
      return this.checkQueue.shift()
    }

    buildAugmentingPath(currentNode: string, goalNode: string): string[] {
      const augmentingPath = [currentNode, goalNode]

      let nextEdgeIsPaired = true
      while (augmentingPath[0] !== this.root) {
        const nextEdge = nextEdgeIsPaired
          ? this.pairedEdge(augmentingPath[0])
          : this.unpairedEdge(augmentingPath[0])

        const nodeToAdd = this.opposite(augmentingPath[0], nextEdge)

        augmentingPath.unshift(nodeToAdd)
        nextEdgeIsPaired = !nextEdgeIsPaired
      }

      return augmentingPath
    }

    private unpairedEdge(node: string) {
      return this.findEdge(node, (_, edgeAttributes) => !edgeAttributes.isPaired)
    }
  }

  addNode(node: string) {
    super.addNode(node, {
      x: 0,
      y: 0,
      size: 20,
      label: node,
      isPaired: false,
    })

    this.alignNodes()

    return node
  }

  private alignNodes() {
    let ang = 0
    const inc = (2 * Math.PI) / this.order

    this.forEachNode((node) => {
      this.setNodeAttribute(node, 'x', Math.cos(ang))
      this.setNodeAttribute(node, 'y', Math.sin(ang))

      ang += inc
    })
  }

  addEdge(node1: string, node2: string) {
    return super.addEdge(node1, node2, { isPaired: false })
  }

  pairNodes() {
    let augmentingPath

    while ((augmentingPath = this.findAugmentingPath()).length) {
      console.log({ augmentingPath })

      this.augmentWith(augmentingPath)
    }

    return this.getPairs()
  }

  private findAugmentingPath(): string[] {
    const startNode = this.pickUnpairedNode()

    console.log({ startNode })

    if (!startNode) return []

    return this.findAugmentingPathRecursive(
      new BlossomGraph.Tree({ root: startNode, source: this })
    )
  }

  private findAugmentingPathRecursive(visited: InstanceType<typeof BlossomGraph.Tree>): string[] {
    const nodeToCheck = visited.dequeueNodeToCheck()

    if (!nodeToCheck) return []

    console.log({ nodeToCheck, neighbors: this.neighborsThroughUnpairedEdges(nodeToCheck) })

    for (const neighbor of this.neighborsThroughUnpairedEdges(nodeToCheck)) {
      if (!this.isPaired(neighbor)) return visited.buildAugmentingPath(nodeToCheck, neighbor)
      else visited.visitPairedNode(nodeToCheck, neighbor)
    }

    return this.findAugmentingPathRecursive(visited)
  }

  private neighborsThroughUnpairedEdges(node: string) {
    const unpairedEdges = this.unpairedEdges(node)

    return unpairedEdges.map((edge) => this.opposite(node, edge))
  }

  protected unpairedEdges(node: string) {
    return this.filterEdges(node, (_, edgeAttributes) => !edgeAttributes.isPaired)
  }

  protected pairedEdge(node: string) {
    return this.findEdge(node, (_, edgeAttributes) => edgeAttributes.isPaired)
  }

  private isPaired(node: string) {
    return this.getNodeAttribute(node, 'isPaired')
  }

  private getMate(pairedNode: string) {
    const pairedEdge = this.pairedEdge(pairedNode)

    return this.opposite(pairedNode, pairedEdge)
  }

  forced = ['0', '2', '3', '1']
  // forced = []
  private pickUnpairedNode() {
    const unpairedNodes = this.filterNodes((_, { isPaired }) => !isPaired)

    const randomIndex = Math.floor(Math.random() * unpairedNodes.length)

    // return unpairedNodes[randomIndex]

    return unpairedNodes.length ? this.forced.shift() : undefined
  }

  private augmentWith(augmentingPath: string[]) {
    let hasToPair = true
    for (let i = 0; i + 1 < augmentingPath.length; i++) {
      const [first, second] = [augmentingPath[i], augmentingPath[i + 1]]

      if (hasToPair) this.pairEdge(first, second)
      else this.unpairEdge(first, second)

      hasToPair = !hasToPair
    }

    this.markNodeAsPaired(augmentingPath[0])
    this.markNodeAsPaired(augmentingPath[augmentingPath.length - 1])
  }

  private markNodeAsPaired(node: string) {
    this.setNodeAttribute(node, 'isPaired', true)
  }

  private pairEdge(node1: string, node2: string) {
    this.setEdgeAttribute(this.edge(node1, node2), 'isPaired', true)
  }

  private unpairEdge(node1: string, node2: string) {
    this.setEdgeAttribute(this.edge(node1, node2), 'isPaired', false)
  }

  private getPairs() {
    const pairedEdges = this.filterEdges((_, { isPaired }) => isPaired)

    return pairedEdges.map((edge) => this.extremities(edge))
  }
}
