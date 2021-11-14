import Sigma from 'sigma'
import { BlossomGraph } from './BlossomGraph'

type CreateRendererParams = { node: HTMLElement }

export const createRenderer = ({ node }: CreateRendererParams) => {
  const graph = new BlossomGraph()

  graph.addNode('0')
  graph.addNode('1')
  graph.addNode('2')
  graph.addNode('3')

  graph.addEdge('0', '1')
  graph.addEdge('0', '2')
  graph.addEdge('1', '2')
  graph.addEdge('1', '3')

  console.log({ pairs: graph.findPairs() })

  new Sigma(graph, node, {
    defaultEdgeColor: '#2D2D2D',
    defaultNodeColor: '#ffc419',
    labelSize: 40,
    edgeLabelWeight: '',
  })
}
