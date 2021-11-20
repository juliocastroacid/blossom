import Sigma from 'sigma'
import { AutoLayoutGraph } from './AutoLayoutGraph'
import { blossom } from './blossom/blossom'
import { BlossomGraph } from './blossom/BlossomGraph'

type CreateRendererParams = { node: HTMLElement }

export const createRenderer = ({ node }: CreateRendererParams) => {
  const graph = new AutoLayoutGraph()

  graph.addNode('0')
  graph.addNode('1')
  graph.addNode('2')
  graph.addNode('3')
  graph.addNode('4')
  graph.addNode('5')

  graph.addEdge('0', '1')
  graph.addEdge('1', '2')
  graph.addEdge('1', '4')
  graph.addEdge('2', '3')
  graph.addEdge('2', '4')
  graph.addEdge('3', '4')
  graph.addEdge('3', '5')

  const blossomGraph = new BlossomGraph(graph)
  console.log('EMPAREJAMIENTO')
  blossom(blossomGraph).forEach(console.log)
  console.log('EMPAREJAMIENTO')

  new Sigma(new AutoLayoutGraph(blossomGraph), node, {
    // new Sigma(graph, node, {
    defaultEdgeColor: '#2D2D2D',
    defaultNodeColor: '#ffc419',
    labelSize: 40,
    edgeLabelWeight: '',
  })
}
