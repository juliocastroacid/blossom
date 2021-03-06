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
  const graph = new BlossomGraph()

  graph.addNode('0')
  graph.addNode('1')
  graph.addNode('2')
  graph.addNode('3')
  graph.addNode('4')
  graph.addNode('5')
  graph.addNode('6')
  graph.addNode('7')
  graph.addNode('8')
  graph.addNode('9')
  graph.addNode('10')
  graph.addNode('11')
  graph.addNode('x')
  graph.addNode('y')
  graph.addNode('a')
  graph.addNode('b')
  graph.addNode('c')
  graph.addNode('d')

  graph.addEdge('x', '0')
  graph.addEdge('0', '1', { arePaired: true })
  graph.addEdge('1', '2')
  graph.addEdge('2', '3', { arePaired: true })
  graph.addEdge('3', '4')
  graph.addEdge('4', '5', { arePaired: true })
  graph.addEdge('5', '6')
  graph.addEdge('6', '7', { arePaired: true })
  graph.addEdge('7', '8')
  graph.addEdge('8', '9', { arePaired: true })
  graph.addEdge('9', '10')
  graph.addEdge('10', '11', { arePaired: true })
  graph.addEdge('10', 'a')
  graph.addEdge('10', 'c')
  graph.addEdge('11', 'y')
  graph.addEdge('11', 'c')
  graph.addEdge('a', 'b', { arePaired: true })
  graph.addEdge('c', 'd', { arePaired: true })
  graph.addEdge('b', 'd')

  const blossomGraph = maximumMatching(graph)

  return new AutoLayoutBlossomGraph(blossomGraph)
}

export const createRenderer = (ref: HTMLElement) => {
  const graph = createGraph()

  const renderer = new Sigma(graph, ref, rendererConfig)

  renderer.getCamera().disable()
}
