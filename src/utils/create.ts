import Graph from 'graphology'
import Sigma from 'sigma'
import { Settings } from 'sigma/settings'
import { maximumMatching } from './blossom-v2/maximumMatching'
import { AutoLayoutBlossomGraph } from './blossom/AutoLayoutBlossomGraph'
import { blossom } from './blossom/blossom'
import { BlossomGraph } from './blossom/BlossomGraph'

const rendererConfig: Partial<Settings> = {
  labelSize: 40,
}

const createGraph = () => {
  const graph = new Graph()

  graph.addNode('0')
  graph.addNode('1')
  graph.addNode('2')
  graph.addNode('3')
  graph.addNode('4')
  graph.addNode('x')

  graph.addEdge('0', '1')
  graph.addEdge('1', '2')
  graph.addEdge('2', '3')
  graph.addEdge('3', '4')
  graph.addEdge('4', '0')

  graph.addEdge('0', 'x')

  const blossomGraph = maximumMatching(graph)

  return new AutoLayoutBlossomGraph(blossomGraph)
}

export const createRenderer = (ref: HTMLElement) => {
  const graph = createGraph()

  const renderer = new Sigma(graph, ref, rendererConfig)

  renderer.getCamera().disable()
}
