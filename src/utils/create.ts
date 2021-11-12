import Sigma from 'sigma'
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

type CreateRendererParams = CreateGraphParams & { node: HTMLElement }

export const createRenderer = ({ node, ...createGraphParams }: CreateRendererParams) => {
  const graph = createGraph(createGraphParams)

  return new Sigma(graph, node, {
    defaultEdgeColor: '#2D2D2D',
    defaultNodeColor: '#ffc419',
    labelSize: 40,
    edgeLabelWeight: '',
  })
}
