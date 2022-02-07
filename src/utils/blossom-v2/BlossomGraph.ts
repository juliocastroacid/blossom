import Graph, { UndirectedGraph } from 'graphology'
import { AugmentingPath } from './AugmentingPath'
import { Blossom } from './Blossom'
import { Matching } from './Mathing'
import { Node } from './Node'

type BlossomNodeAttributes = {
  blossom?: Blossom
}

type BlossomEdgeAttributes = {
  arePaired?: boolean
}

export class BlossomGraph extends UndirectedGraph<BlossomNodeAttributes, BlossomEdgeAttributes> {
  static createFrom(graph: Graph) {
    const blossomGraph = new BlossomGraph()

    graph.forEachNode((node, attr) => blossomGraph.addNode(node, attr))
    graph.forEachEdge((edge, attr) => blossomGraph.addEdge(...graph.extremities(edge), attr))

    return blossomGraph
  }

  augmentWith(augmentingPath: AugmentingPath) {
    let hasToPair = true
    for (let i = 0; i + 1 < augmentingPath.length; i++) {
      const [first, second] = [augmentingPath[i], augmentingPath[i + 1]]

      if (hasToPair) this.pair(first, second)
      else this.unpair(first, second)

      hasToPair = !hasToPair
    }
  }

  pair(node1: Node, node2: Node) {
    const edge = this.edge(node1, node2)

    this.setEdgeAttribute(edge, 'arePaired', true)
  }

  unpair(node1: Node, node2: Node) {
    const edge = this.edge(node1, node2)

    this.setEdgeAttribute(edge, 'arePaired', false)
  }

  matching(): Matching {
    return this.pairedEdges().map((edge) => this.extremities(edge))
  }

  pairedEdges() {
    return this.filterEdges((_, { arePaired }) => arePaired)
  }

  pairedNodes(): Node[] {
    return this.pairedEdges().flatMap((edge) => this.extremities(edge))
  }

  unpairedNodes(): Node[] {
    const pairedNodes = this.pairedNodes()

    return this.nodes().filter((node) => !pairedNodes.includes(node))
  }

  neighborsThroughUnpairedEdges(node: Node): Node[] {
    const nodeUnpairedEdges = this.filterEdges(node, (_, { arePaired }) => !arePaired)

    return nodeUnpairedEdges.map((edge) => this.opposite(node, edge))
  }

  getMate(node: Node) {
    const nodePairedEdge = this.findEdge(node, (_, { arePaired }) => arePaired)

    if (!nodePairedEdge) throw new Error(`Node ${node} is not paired`)

    return this.opposite(node, nodePairedEdge)
  }

  isPaired(node: Node) {
    return this.pairedNodes().includes(node)
  }

  isSuperNode(node: Node) {
    return Boolean(this.getNodeAttribute(node, 'blossom'))
  }

  compressBlossom(blossom: Blossom) {
    const newGraph = BlossomGraph.createFrom(this)

    const { cycle } = blossom
    const superNode = cycle.join('-')

    newGraph.addNode(superNode, { blossom })
    cycle
      .flatMap((node) => newGraph.neighbors(node))
      .filter((node) => !blossom.has(node))
      .filter((node, i, nodes) => nodes.indexOf(node) === i) // remove duplicates
      .forEach((superNodeNeighbor) =>
        newGraph.addEdge(superNode, superNodeNeighbor, {
          arePaired: newGraph.isPaired(superNodeNeighbor),
        })
      )
    cycle.forEach((node) => newGraph.dropNode(node))

    return newGraph
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
