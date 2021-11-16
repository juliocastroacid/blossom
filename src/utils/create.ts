import Graph from 'graphology'
import Sigma from 'sigma'
import { AutoLayoutGraph } from './AutoLayoutGraph'
import { BlossomGraph } from './BlossomGraph'

type CreateRendererParams = { node: HTMLElement }

export const createRenderer = ({ node }: CreateRendererParams) => {
  const graph = new Graph()

  graph.addNode('0')
  graph.addNode('1')
  graph.addNode('2')
  graph.addNode('3')
  graph.addNode('4')

  graph.addEdge('0', '1')
  graph.addEdge('1', '2')
  graph.addEdge('2', '3')
  graph.addEdge('3', '4')
  graph.addEdge('4', '2')

  new Sigma(new AutoLayoutGraph(graph), node, {
    defaultEdgeColor: '#2D2D2D',
    defaultNodeColor: '#ffc419',
    labelSize: 40,
    edgeLabelWeight: '',
  })
}
