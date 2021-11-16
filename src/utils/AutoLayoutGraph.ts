import Graph from 'graphology'

export class AutoLayoutGraph extends Graph {
  constructor(graph?: Graph) {
    super()

    if (graph) {
      graph.nodes().forEach((node) => this.addNode(node))
      graph.edges().forEach((edge) => this.addEdge(...graph.extremities(edge)))
    }
  }

  addNode(node: string) {
    const res = super.addNode(node, { size: 20, label: node })

    this.alignNodes()

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
