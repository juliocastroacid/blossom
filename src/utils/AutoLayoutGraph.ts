import Graph from 'graphology'

export class AutoLayoutGraph extends Graph {
  constructor(graph: Graph) {
    super()

    graph.nodes().forEach((node) =>
      this.addNode(node, {
        x: 0,
        y: 0,
        size: 20,
        label: node,
      })
    )

    graph.edges().forEach((edge) => this.addEdge(...graph.extremities(edge)))

    this.alignNodes()
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
