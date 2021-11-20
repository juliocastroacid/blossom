import Graph from 'graphology'
import { BlossomGraph } from './BlossomGraph'

export class AutoLayoutBlossomGraph extends Graph {
  constructor(source: BlossomGraph) {
    super()

    source.nodes().forEach((node) => this.addNode(node, source))
    source.edges().forEach((edge) => this.addEdge(edge, source))
  }

  addNode(node: string, source: BlossomGraph) {
    const isPaired = source.isPaired(node)

    const res = super.addNode(node, {
      size: 20,
      label: node,
      color: isPaired ? '#6262dd' : '#ffc419',
    })

    this.alignNodes()

    return res
  }

  addEdge(edge: string, source: BlossomGraph) {
    const [node1, node2] = source.extremities(edge)

    const arePaired = source.getEdgeAttribute(edge, 'arePaired')

    const res = super.addEdge(node1, node2, {
      color: arePaired ? '#6262dd' : '#0a0a0a',
      size: arePaired ? 10 : 3,
    })

    return res
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
}
