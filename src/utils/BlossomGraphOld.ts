import { UndirectedGraph } from 'graphology'

type SuperNodeBackup = Array<{
  node: string
  attributes: BlossomNodeAttributes
  neighbors: Array<{ neighbor: string; edgeAttributes: BlossomEdgeAttributes }>
}>

type BlossomNodeAttributes = {
  x: number
  y: number
  size: number
  label: string
  isPaired: boolean
  superNodeBackup?: SuperNodeBackup
}

type BlossomEdgeAttributes = {
  isPaired: boolean
}

export class BlossomGraphOld extends UndirectedGraph<BlossomNodeAttributes, BlossomEdgeAttributes> {
  private static Visited = class extends BlossomGraphOld {
    private readonly origin: BlossomGraphOld

    private readonly root: string

    private checkQueue: string[]

    constructor(readonly p: { root: string; source: BlossomGraphOld }) {
      super()
      this.root = p.root
      this.origin = p.source

      this.copyNode(p.root)
      this.checkQueue = [p.root]

      console.log({ root: this.root })
    }

    restoreSuperNode(superNode: string) {
      const backup = this.getNodeAttribute(superNode, 'superNodeBackup')

      if (!backup) throw new Error(`Node ${superNode} is not a super node`)

      const superNodeElements = backup.map(({ node }) => node)
      const superNodeNeighbors = this.neighbors(superNode)

      super.restoreSuperNode(superNode)

      superNodeNeighbors.forEach((neighbor) => {
        const matchingNode = superNodeElements.find((node) =>
          this.origin.areNeighbors(node, neighbor)
        )

        if (matchingNode) this.copyEdge(matchingNode, neighbor)
      })
    }

    visitPairedNode(currentNode: string, visitedPairedNode: string) {
      const pairedMate = this.origin.getMate(visitedPairedNode)

      this.copyNode(visitedPairedNode)
      this.copyNode(pairedMate)

      this.copyEdge(currentNode, visitedPairedNode)
      this.copyEdge(visitedPairedNode, pairedMate)

      this.checkQueue.unshift(pairedMate)
    }

    removeBlossom(currentNode: string, blossomNode: string) {
      const cycle = this.findCycle(currentNode, blossomNode)
      this.copyEdge(currentNode, blossomNode)

      const superNode = this.mergeNodes(cycle)
      this.origin.mergeNodes(cycle)

      this.checkQueue = [superNode, ...this.checkQueue.filter((node) => !cycle.includes(node))]

      return this
    }

    private findCycle(node1: string, node2: string) {
      const node1RootPath = this.findPathToRoot(node1)
      const node2RootPath = this.findPathToRoot(node2)

      const intersection = node1RootPath.filter((node) => node2RootPath.includes(node))
      const [pivot] = intersection

      const pivotIndexInNode1RootPath = node1RootPath.findIndex((node) => node === pivot)
      const pivotIndexInNode2RootPath = node2RootPath.findIndex((node) => node === pivot)

      return [
        ...node1RootPath.slice(0, pivotIndexInNode1RootPath),
        pivot,
        ...node2RootPath.slice(0, pivotIndexInNode2RootPath),
      ]
    }

    private findPathToRoot(node: string): string[] {
      if (this.areNeighbors(node, this.root)) return [node, this.root]

      for (const neighbor of this.neighbors(node)) {
        const path = this.findPathToRoot(neighbor)

        if (path.length) return [node, ...path]
      }

      return []
    }

    private copyNode(node: string) {
      this.mergeNode(node)

      this.replaceNodeAttributes(node, this.origin.getNodeAttributes(node))
    }

    private copyEdge(node1: string, node2: string) {
      const edge = this.mergeEdge(node1, node2)

      this.replaceEdgeAttributes(
        edge,
        this.origin.getEdgeAttributes(this.origin.edge(node1, node2))
      )
    }

    dequeueNodeToCheck() {
      return this.checkQueue.shift()
    }

    buildAugmentingPath(lastNodeInVisited: string, goalNode: string): string[] {
      this.copyNode(goalNode)
      this.copyEdge(lastNodeInVisited, goalNode)

      this.origin.restoreAllSuperNodes()
      this.restoreAllSuperNodes()

      // console.log({
      //   time: 'after',
      //   connections: this.nodes().map((node) => ({
      //     node,
      //     neighbors: this.neighbors(node),
      //   })),
      // })

      const augmentingPath = [goalNode]

      let nextEdgeIsPaired = false
      let currentNode = goalNode

      while (currentNode !== this.root) {
        const nextEdge = nextEdgeIsPaired
          ? this.pairedEdge(currentNode)
          : this.unpairedEdge(currentNode)

        const nodeToAdd = this.opposite(currentNode, nextEdge)

        augmentingPath.unshift(nodeToAdd)
        nextEdgeIsPaired = !nextEdgeIsPaired
        currentNode = augmentingPath[0]
      }

      return augmentingPath
    }

    private unpairedEdge(node: string) {
      return this.findEdge(node, (_, edgeAttributes) => !edgeAttributes.isPaired)
    }
  }

  addNode(node: string, attributes?: Partial<BlossomNodeAttributes>) {
    super.addNode(node, {
      x: 0,
      y: 0,
      size: 20,
      label: node,
      isPaired: false,
      ...attributes,
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

    this.alignNodes()

    return this.getPairs()
  }

  private findAugmentingPath(): string[] {
    const startNode = this.pickUnpairedNode()

    if (!startNode) return []

    return this.findAugmentingPathRecursive(
      new BlossomGraphOld.Visited({ root: startNode, source: this })
    )
  }

  private findAugmentingPathRecursive(
    visited: InstanceType<typeof BlossomGraphOld.Visited>
  ): string[] {
    const nodeToCheck = visited.dequeueNodeToCheck()

    if (!nodeToCheck) return []

    for (const neighbor of this.neighborsThroughUnpairedEdges(nodeToCheck)) {
      if (!this.isPaired(neighbor)) return visited.buildAugmentingPath(nodeToCheck, neighbor)
      else if (visited.hasNode(neighbor))
        return this.findAugmentingPathRecursive(visited.removeBlossom(nodeToCheck, neighbor))
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

  forced = ['3', '4', '0', '2', '1']
  // forced = []
  private pickUnpairedNode() {
    const unpairedNodes = this.filterNodes((_, { isPaired }) => !isPaired)

    const randomIndex = Math.floor(Math.random() * unpairedNodes.length)

    const selection = unpairedNodes[randomIndex]

    // console.log({ selection })

    // return selection
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

  markNodeAsPaired(node: string) {
    this.setNodeAttribute(node, 'isPaired', true)
  }

  pairEdge(node1: string, node2: string) {
    this.setEdgeAttribute(this.edge(node1, node2), 'isPaired', true)
  }

  unpairEdge(node1: string, node2: string) {
    this.setEdgeAttribute(this.edge(node1, node2), 'isPaired', false)
  }

  private getPairs() {
    const pairedEdges = this.filterEdges((_, { isPaired }) => isPaired)

    return pairedEdges.map((edge) => this.extremities(edge))
  }

  mergeNodes(nodes: string[]) {
    const superNode = nodes.join('-')

    const superNodeBackup: SuperNodeBackup = nodes.map((node) => ({
      node,
      attributes: this.getNodeAttributes(node),
      neighbors: this.neighbors(node).map((neighbor) => ({
        neighbor,
        edgeAttributes: this.getEdgeAttributes(this.edge(node, neighbor)),
      })),
    }))

    const superNodeNeighbors = Array.from(
      new Set(nodes.flatMap((node) => this.neighbors(node)))
    ).filter((node) => !nodes.includes(node))

    this.addNode(superNode, { superNodeBackup })
    superNodeNeighbors.forEach((neighbor) => this.addEdge(superNode, neighbor))
    nodes.forEach((node) => this.dropNode(node))

    return superNode
  }

  isSuperNode(node: string) {
    return Boolean(this.getNodeAttribute(node, 'superNodeBackup'))
  }

  restoreAllSuperNodes() {
    this.nodes()
      .filter((node) => this.isSuperNode(node))
      .forEach((superNode) => this.restoreSuperNode(superNode))
  }

  restoreSuperNode(superNode: string) {
    const backup = this.getNodeAttribute(superNode, 'superNodeBackup')

    if (!backup) throw new Error(`Node ${superNode} is not a super node`)

    backup.forEach(({ node, attributes }) => this.addNode(node, attributes))

    backup.forEach(({ node, neighbors }) =>
      neighbors.forEach(({ neighbor, edgeAttributes }) =>
        this.mergeEdge(node, neighbor, edgeAttributes)
      )
    )

    this.dropNode(superNode)
  }
}
