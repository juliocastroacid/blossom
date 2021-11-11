import Graph from 'graphology'

class MyGraph extends Graph {
  ang = 0
  inc: number

  constructor(readonly myNodes: string[]) {
    super()
    this.inc = (2 * Math.PI) / myNodes.length
  }

  addNode(node: string) {
    const nodeObj = {
      x: Math.cos(this.ang),
      y: Math.sin(this.ang),
      size: 20,
      label: node,
      color: '#FFFFFF',
    }

    this.incAngle()

    return super.addNode(node, nodeObj)
  }

  private incAngle() {
    this.ang += this.inc
  }
}

export const createGraph = () => {
  // const nodes = ['1', '2', '3']
  const nodes = [...new Array(20)].map((_, index) => index.toString())
  const graph = new MyGraph(nodes)

  nodes.forEach((node) => graph.addNode(node))

  nodes.forEach((node, index) => {
    const rest = nodes.slice(index + 1)

    rest.forEach((otherNode) => graph.addEdge(node, otherNode))
  })

  return graph
}
