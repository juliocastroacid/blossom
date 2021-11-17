import Graph from 'graphology'
import Sigma from 'sigma'
import { AutoLayoutGraph } from './AutoLayoutGraph'
import { blossom } from './blossom/blossom'
import { BlossomGraph } from './blossom/BlossomGraph'
import { BlossomGraphOld } from './BlossomGraphOld'

type CreateRendererParams = { node: HTMLElement }

export const createRenderer = ({ node }: CreateRendererParams) => {
  const graph = new AutoLayoutGraph()

  graph.addNode('0')
  graph.addNode('1')
  graph.addNode('2')
  graph.addNode('3')

  graph.addEdge('0', '1')
  graph.addEdge('3', '2')
  graph.addEdge('2', '1')
  graph.addEdge('3', '1')

  const blossomGraph = new BlossomGraph(graph)
  console.log('START')
  blossom(blossomGraph).forEach(console.log)
  console.log('END')

  new Sigma(new AutoLayoutGraph(blossomGraph), node, {
    // new Sigma(graph, node, {
    defaultEdgeColor: '#2D2D2D',
    defaultNodeColor: '#ffc419',
    labelSize: 40,
    edgeLabelWeight: '',
  })
}
