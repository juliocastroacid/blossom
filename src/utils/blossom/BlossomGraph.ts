import Graph, { UndirectedGraph } from 'graphology'
import { BlossomVisited } from './BlossomVisited'

type SuperNodeBackup = Array<{
  node: string
  attributes: BlossomNodeAttributes
  neighbors: Array<{ neighbor: string; edgeAttributes: BlossomEdgeAttributes }>
}>

type BlossomNodeAttributes = {
  superNodeBackup?: SuperNodeBackup
}

type BlossomEdgeAttributes = {
  arePaired: boolean
}

export class BlossomGraph extends UndirectedGraph<BlossomNodeAttributes, BlossomEdgeAttributes> {
  constructor(graph: Graph) {
    super()

    graph.nodes().forEach((node) => this.addNode(node))
    graph.edges().forEach((edge) =>
      this.addEdge(...graph.extremities(edge), {
        arePaired: false,
      })
    )
  }

  pairAllNodes() {
    let augmentingPath

    while ((augmentingPath = this.findAugmentingPath()).length) {
      console.log({ augmentingPath })

      this.augmentWith(augmentingPath)
    }

    return this.getPairs()
  }

  private findAugmentingPath(): string[] {
    const startNode = this.pickUnpairedNode()

    if (!startNode) return []

    return this.findAugmentingPathRecursive(new BlossomVisited(startNode))
  }

  private findAugmentingPathRecursive(visited: BlossomVisited): string[] {
    const nodeToCheck = visited.dequeueNodeToCheck()

    if (!nodeToCheck) return []

    for (const neighbor of this.neighborsThroughUnpairedEdges(nodeToCheck)) {
      if (!this.isPaired(neighbor)) return this.buildAugmentingPath(visited, neighbor)
      else if (visited.has(neighbor)) console.log('loop!')
      // return this.findAugmentingPathRecursive(visited.removeBlossom(nodeToCheck, neighbor))
      else visited.visitPair(neighbor, this.getMate(neighbor))
    }

    return this.findAugmentingPathRecursive(visited)
  }

  private isPaired(node: string) {
    return Boolean(this.findEdge(node, (_, { arePaired }) => arePaired))
  }

  private buildAugmentingPath(visited: BlossomVisited, goalNode: string) {
    return [goalNode, ...visited.pathToStart()]
  }

  forced = ['0', '2']
  private pickUnpairedNode() {
    // if (true) return this.forced.shift()

    const unpairedNodes = this.unpairedNodes()

    const randomIndex = Math.floor(Math.random() * unpairedNodes.length)

    const selection = unpairedNodes[randomIndex]

    // console.log({ selection })

    return selection
  }

  private augmentWith(augmentingPath: string[]) {
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

  private pairedNodes() {
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

  createSuperNode(nodes: string[]) {
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

  private neighborsThroughUnpairedEdges(node: string) {
    const nodeUnpairedEdges = this.filterEdges(node, (_, { arePaired }) => !arePaired)

    return nodeUnpairedEdges.map((edge) => this.opposite(node, edge))
  }

  private getMate(node: string) {
    const nodePairedEdge = this.findEdge(node, (_, { arePaired }) => arePaired)

    if (!nodePairedEdge) throw new Error(`Node ${node} is not paired`)

    return this.opposite(node, nodePairedEdge)
  }
}
