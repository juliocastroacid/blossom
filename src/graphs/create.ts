import { MyGraph } from './MyGraph'

export type CreateGraphParams = {
  numberOfVertices: number
}

export const createGraph = ({ numberOfVertices }: CreateGraphParams) => {
  const nodes = [...new Array(numberOfVertices)].map((_, index) => index.toString())
  const graph = new MyGraph(nodes)

  nodes.forEach((node) => graph.addNode(node))

  nodes.forEach((node, index) => {
    const rest = nodes.slice(index + 1)

    rest.forEach((otherNode) => graph.addEdge(node, otherNode))
  })

  return graph
}
