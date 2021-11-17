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

      graphWithoutBlossom.debug()

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

  graph.debug()

  augmentingPath.forEach((node, index, array) => {
    if (graph.isSuperNode(node)) {
      const restoredBlossom = restoreBlossom({
        graph,
        superNode: node,
        previousNode: array[index - 1],
        nextNode: array[index + 1],
      })

      augmentingPath.push(...restoredBlossom)
    } else augmentingPath.push(node)
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
  if (!previousNode || !nextNode) throw new Error('Isolated blossom')

  graph.restoreSuperNode(superNode)

  const cycle = superNode.split('-')
  const connectionNode = previousNode ?? nextNode

  if (!previousNode) return restoreStartingBlossom({ graph, connectionNode, cycle })
  if (!nextNode) return restoreEndingBlossom({ graph, connectionNode, cycle })

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
  const linkNodeIndex = cycle.findIndex((node) => graph.areNeighbors(connectionNode, node))
  const linkNode = cycle[linkNodeIndex]

  if (!linkNode) throw new Error('Cannot link blossom cycle')

  const unpairedNode = cycle.find((node) => !graph.isPaired(node))

  // we need to build a path from linkNode
  // to unpairedNode such as the number of steps is even
  const clockWisePath: string[] = []
  for (
    let i = linkNodeIndex;
    clockWisePath[clockWisePath.length - 1] !== unpairedNode;
    i = (i + 1) % cycle.length
  )
    clockWisePath.push(cycle[i])

  if (clockWisePath.length % 2 === 0) return clockWisePath

  const counterClockWisePath: string[] = []
  for (
    let i = linkNodeIndex;
    clockWisePath[clockWisePath.length - 1] !== unpairedNode;
    i = (i - 1) % cycle.length
  )
    clockWisePath.push(cycle[i])

  return counterClockWisePath
}
