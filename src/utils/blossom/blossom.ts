import Graph from 'graphology'
import { BlossomGraph } from './BlossomGraph'
import { BlossomVisited } from './BlossomVisited'

export function blossom(graph: Graph) {
  const blossomGraph = new BlossomGraph(graph)

  let augmentingPath
  while ((augmentingPath = findAugmentingPath(blossomGraph)).length) {
    console.log({ augmentingPath })

    blossomGraph.augmentWith(augmentingPath)
  }

  return blossomGraph.getPairs()
}

function findAugmentingPath(blossomGraph: BlossomGraph): string[] {
  const startNode = blossomGraph.pickUnpairedNode()

  if (!startNode) return []

  return findAugmentingPathRecursive({
    visited: new BlossomVisited(startNode),
    graph: blossomGraph,
  })
}

type FindAugmentingPathRecursiveParams = {
  visited: BlossomVisited
  graph: BlossomGraph
}

function findAugmentingPathRecursive({
  visited,
  graph,
}: FindAugmentingPathRecursiveParams): string[] {
  const nodeToCheck = visited.dequeueNodeToCheck()

  if (!nodeToCheck) return []

  for (const neighbor of graph.neighborsThroughUnpairedEdges(nodeToCheck)) {
    if (!graph.isPaired(neighbor)) return graph.buildAugmentingPath(visited, neighbor)
    else if (visited.has(neighbor)) {
      const graphWithoutBlossom = removeBlossom({
        graph,
        cycleNodes: [neighbor, nodeToCheck],
        visited,
      })

      const augmentingPath = findAugmentingPath(graphWithoutBlossom)

      return restoreBlossoms({ graph: graphWithoutBlossom, augmentingPath })
    } else visited.visitPair(neighbor, graph.getMate(neighbor))
  }

  return findAugmentingPathRecursive({ visited, graph })
}

type RemoveBlossomParams = {
  graph: BlossomGraph
  cycleNodes: [string, string]
  visited: BlossomVisited
}

function removeBlossom({ cycleNodes, visited, graph }: RemoveBlossomParams) {
  const copy = graph.createCopy()

  const cycle = visited.findCycle(...cycleNodes)

  copy.createSuperNode(cycle)

  return copy
}

type RestoreBlossomsParams = {
  graph: BlossomGraph
  augmentingPath: string[]
}

function restoreBlossoms({ graph, augmentingPath }: RestoreBlossomsParams) {
  const augmentingPathWithoutBlossoms: string[] = []

  augmentingPath.forEach((node, index, array) => {
    if (graph.isSuperNode(node)) {
      const restoredBlossom = restoreBlossom({
        graph,
        superNode: node,
        previousNode: array[index - 1],
        nextNode: array[index + 1],
      })

      augmentingPathWithoutBlossoms.push(...restoredBlossom)
    } else augmentingPathWithoutBlossoms.push(node)
  })

  return augmentingPathWithoutBlossoms
}

type RestoreBlossomParams = {
  superNode: string
  graph: BlossomGraph
  previousNode: string | undefined
  nextNode: string | undefined
}

function restoreBlossom({ superNode, graph, previousNode, nextNode }: RestoreBlossomParams) {
  const cycle = graph.getSuperNodeCycle(superNode)

  graph.restoreSuperNode(superNode)

  if (!previousNode && nextNode)
    return restoreStartingBlossom({ graph, connectionNode: nextNode, cycle })

  if (previousNode && !nextNode)
    return restoreEndingBlossom({ graph, connectionNode: previousNode, cycle })

  console.log('TODO: Middle blossom case!!!')

  return []
}

type RestoreEdgeBlossomParams = {
  graph: BlossomGraph
  connectionNode: string
  cycle: string[]
}

function restoreStartingBlossom(params: RestoreEdgeBlossomParams) {
  return restoreEndingBlossom(params).reverse()
}

function restoreEndingBlossom({ cycle, connectionNode, graph }: RestoreEdgeBlossomParams) {
  const linkNode = cycle.find((node) => graph.areNeighbors(connectionNode, node))
  const unpairedNode = cycle.find((node) => !graph.isPaired(node))

  if (!linkNode || !unpairedNode) throw new Error('Cannot link blossom cycle')

  // we need to build a path from linkNode
  // to unpairedNode such as the number of steps is even
  // (the length of the path has to be odd)
  const path = clockWisePath({ start: linkNode, target: unpairedNode, cycle })

  return path.length % 2 !== 0
    ? path
    : counterClockWisePath({ start: linkNode, target: unpairedNode, cycle })
}

type ClockPathParams = {
  start: string
  target: string
  cycle: string[]
}

function clockWisePath({ start, target, cycle }: ClockPathParams) {
  const startIndex = cycle.findIndex((node) => node === start)

  const path: string[] = []
  for (let i = startIndex; path[path.length - 1] !== target; i = mod(i + 1, cycle.length))
    path.push(cycle[i])

  return path
}

function counterClockWisePath({ start, target, cycle }: ClockPathParams) {
  const startIndex = cycle.findIndex((node) => node === start)

  const path: string[] = []
  for (let i = startIndex; path[path.length - 1] !== target; i = mod(i - 1, cycle.length))
    path.push(cycle[i])

  return path
}

function mod(a: number, m: number) {
  return ((a % m) + m) % m
}
