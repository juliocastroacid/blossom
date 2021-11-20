import Graph from 'graphology'
import Sigma from 'sigma'
import { Settings } from 'sigma/settings'
import { AutoLayoutBlossomGraph } from './blossom/AutoLayoutBlossomGraph'
import { blossom } from './blossom/blossom'

const rendererConfig: Partial<Settings> = {
  labelSize: 40,
}

export const createRenderer = (ref: HTMLElement) => {
  const graph = new Graph()

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

  const blossomGraph = blossom(graph)

  new Sigma(new AutoLayoutBlossomGraph(blossomGraph), ref, rendererConfig)
}
