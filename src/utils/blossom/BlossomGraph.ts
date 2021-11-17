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
    const copy = new BlossomGraph()

    copy.copyData(this)

    return copy
  }

  isPaired(node: string) {
    return Boolean(this.findEdge(node, (_, { arePaired }) => arePaired))
  }

  buildAugmentingPath(visited: BlossomVisited, goalNode: string) {
    return [goalNode, ...visited.pathToStart()]
  }

  static forced = ['2', '3']
  pickUnpairedNode() {
    if (BlossomGraph.forced.length) return BlossomGraph.forced.shift()

    const unpairedNodes = this.unpairedNodes()

    const randomIndex = Math.floor(Math.random() * unpairedNodes.length)

    const selection = unpairedNodes[randomIndex]

    return selection
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

  private unpairedNodes() {
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
      .flatMap((node) => this.edges(node))
      .filter((edge) => this.extremities(edge).some((node) => !cycle.includes(node)))
      .forEach((edge) => {
        const nodeOutsideCycle = this.extremities(edge).find((node) => !cycle.includes(node))

        this.addEdge(superNode, nodeOutsideCycle, this.getEdgeAttributes(edge))
      })

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

  debug() {
    console.log({
      nodes: this.nodes(),
      edges: this.edges().map((edge) => this.extremities(edge)),
      paired: this.pairedEdges().map((edge) => this.extremities(edge)),
    })
  }
}
