import Graph, { UndirectedGraph } from 'graphology'
import { BlossomVisited } from './BlossomVisited'

type SuperNodeData = {
  data: Array<{
    node: string
    attributes: BlossomNodeAttributes
    neighbors: Array<{ neighbor: string; edgeAttributes: BlossomEdgeAttributes }>
  }>
}

type BlossomNodeAttributes = {
  superNodeData?: SuperNodeData
}

type BlossomEdgeAttributes = {
  arePaired: boolean
}

export class BlossomGraph extends UndirectedGraph<BlossomNodeAttributes, BlossomEdgeAttributes> {
  constructor(graph?: Graph) {
    super()

    if (graph) this.copyData(graph)
  }

  copyData(graph: Graph<any, any>) {
    graph.nodes().forEach((node) => this.addNode(node))
    graph.forEachEdge((edge, attributes) => this.addEdge(...graph.extremities(edge), attributes))
  }

  createCopy() {
    return new BlossomGraph(this)
  }

  isPaired(node: string) {
    return Boolean(this.findEdge(node, (_, { arePaired }) => arePaired))
  }

  buildAugmentingPath(visited: BlossomVisited, goalNode: string) {
    return [goalNode, ...visited.pathToStart()]
  }

  augmentWith(augmentingPath: string[]) {
    let hasToPair = true
    for (let i = 0; i + 1 < augmentingPath.length; i++) {
      const [first, second] = [augmentingPath[i], augmentingPath[i + 1]]

      if (hasToPair) this.pair(first, second)
      else this.unpair(first, second)

      hasToPair = !hasToPair
    }
  }

  getPairs() {
    return this.pairedEdges().map((edge) => this.extremities(edge))
  }

  private pairedEdges() {
    return this.filterEdges((_, { arePaired }) => arePaired)
  }

  pairedNodes() {
    const pairedEdges = this.pairedEdges()

    return pairedEdges.flatMap((edge) => this.extremities(edge))
  }

  unpairedNodes() {
    const pairedNodes = this.pairedNodes()

    return this.nodes().filter((node) => !pairedNodes.includes(node))
  }

  pair(node1: string, node2: string) {
    const edge = this.edge(node1, node2)

    this.setEdgeAttribute(edge, 'arePaired', true)
  }

  unpair(node1: string, node2: string) {
    const edge = this.edge(node1, node2)

    this.setEdgeAttribute(edge, 'arePaired', false)
  }

  createSuperNode(cycle: string[]) {
    const superNode = cycle.join('-')

    const superNodeData: SuperNodeData = {
      data: cycle.map((node) => ({
        node,
        attributes: this.getNodeAttributes(node),
        neighbors: this.neighbors(node).map((neighbor) => ({
          neighbor,
          edgeAttributes: this.getEdgeAttributes(this.edge(node, neighbor)),
        })),
      })),
    }

    this.addNode(superNode, { superNodeData })

    cycle
      .flatMap((node) => this.neighbors(node))
      .filter((node) => !cycle.includes(node))
      .filter((node, i, nodes) => nodes.indexOf(node) === i) // remove duplicates
      .forEach((superNodeNeighbor) =>
        this.addEdge(superNode, superNodeNeighbor, { arePaired: this.isPaired(superNodeNeighbor) })
      )

    cycle.forEach((node) => this.dropNode(node))

    return superNode
  }

  isSuperNode(node: string) {
    return Boolean(this.getNodeAttribute(node, 'superNodeData'))
  }

  restoreSuperNode(superNode: string) {
    const backup = this.getNodeAttribute(superNode, 'superNodeData')

    if (!backup) throw new Error(`Node ${superNode} is not a super node`)

    backup.data.forEach(({ node, attributes }) => this.mergeNode(node, attributes))

    backup.data.forEach(({ node, neighbors }) =>
      neighbors.forEach(({ neighbor, edgeAttributes }) =>
        this.mergeEdge(node, neighbor, edgeAttributes)
      )
    )

    this.dropNode(superNode)
  }

  neighborsThroughUnpairedEdges(node: string) {
    const nodeUnpairedEdges = this.filterEdges(node, (_, { arePaired }) => !arePaired)

    return nodeUnpairedEdges.map((edge) => this.opposite(node, edge))
  }

  getMate(node: string) {
    const nodePairedEdge = this.findEdge(node, (_, { arePaired }) => arePaired)

    if (!nodePairedEdge) throw new Error(`Node ${node} is not paired`)

    return this.opposite(node, nodePairedEdge)
  }

  getSuperNodeCycle(superNode: string) {
    const backup = this.getNodeAttribute(superNode, 'superNodeData')

    if (!backup) throw new Error(`${superNode} is not a SuperNode`)

    return backup.data.map((d) => d.node)
  }

  debug(title?: string) {
    console.dir(
      {
        title,
        nodes: this.nodes(),
        paired: this.pairedEdges().map((edge) => this.extremities(edge)),
        edges: this.edges().map((edge) => ({
          ext: this.extremities(edge),
          attr: this.getEdgeAttributes(edge),
        })),
      },
      { depth: 4 }
    )
  }
}
