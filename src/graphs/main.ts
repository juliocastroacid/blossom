import Sigma from 'sigma'
import { createGraph } from './create'

export const renderGraph = (node: HTMLElement | null) => {
  if (!node) return

  const graph = createGraph()

  new Sigma(graph, node, {})
}
