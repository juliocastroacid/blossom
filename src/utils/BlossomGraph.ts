import Graph from 'graphology'

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

export class BlossomGraph extends Graph<BlossomNodeAttributes, BlossomEdgeAttributes> {
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

  addEdge(node1: string, node2: string) {
    return super.addEdge(node1, node2, { isPaired: false })
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

  pair(node1: string, node2: string) {
    const edge = this.edge(node1, node2)

    if (!edge) throw new Error(`${node1} and ${node2} are not connected`)

    this.setNodeAttribute(node1, 'isPaired', true)
    this.setNodeAttribute(node2, 'isPaired', true)
    this.setEdgeAttribute(edge, 'isPaired', true)
  }

  findPairs() {
    let augmentingPath

    do {
      augmentingPath = this.findAugmentingPath()
    } while (augmentingPath.length)

    return this.getPairs()
  }

  private findAugmentingPath(): string[] {
    const unpairNode = this.pickUnpairedNode()

    return []
  }

  private pickUnpairedNode() {
    const unpairedNodes = this.filterNodes((_, { isPaired }) => !isPaired)

    const randomIndex = Math.floor(Math.random() * unpairedNodes.length)

    return unpairedNodes[randomIndex]
  }

  private getPairs() {
    const pairedEdges = this.filterEdges((_, { isPaired }) => isPaired)

    return pairedEdges.map((edge) => this.extremities(edge))
  }
}
