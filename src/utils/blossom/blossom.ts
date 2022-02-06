import Graph from 'graphology'
import { BlossomGraph } from './BlossomGraph'
import { BlossomVisited } from './BlossomVisited'

export function blossom(graph: Graph) {
  const blossomGraph = new BlossomGraph(graph)

  let augmentingPath
  let maxIterations = Infinity

  while (maxIterations-- && (augmentingPath = findAugmentingPath(blossomGraph)).length) {
    blossomGraph.augmentWith(augmentingPath)
  }

  return blossomGraph
}

function findAugmentingPath(blossomGraph: BlossomGraph): string[] {
  const unpairedNodes = blossomGraph.unpairedNodes()

  let unpairedNode

  while ((unpairedNode = pickAndRemoveNode(unpairedNodes))) {
    const augmentingPath = findAugmentingPathRecursive({
      visited: new BlossomVisited(unpairedNode),
      graph: blossomGraph,
    })

    if (augmentingPath.length) return augmentingPath
  }

  return []
}

function pickAndRemoveNode(nodes: string[]) {
  const randomIndex = Math.floor(Math.random() * nodes.length)

  const selection = nodes[randomIndex]
  nodes.splice(randomIndex, 1)

  return selection
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
      const cycle = visited.findCycle(neighbor, nodeToCheck)

      if (cycle.length % 2 !== 0) {
        const graphWithoutBlossom = removeBlossom({ graph, blossom: cycle })

        const augmentingPath = findAugmentingPath(graphWithoutBlossom)

        return restoreBlossoms({ graph: graphWithoutBlossom, augmentingPath })
      }
    } else visited.visitPair(neighbor, graph.getMate(neighbor))
  }

  return findAugmentingPathRecursive({ visited, graph })
}

type RemoveBlossomParams = {
  graph: BlossomGraph
  blossom: string[]
}

function removeBlossom({ blossom, graph }: RemoveBlossomParams) {
  const copy = graph.createCopy()

  copy.createSuperNode(blossom)

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

  if (!previousNode || !nextNode) throw new Error('Inconsistent blossom')

  return restoreMiddleBlossom({
    graph,
    previousConnectionNode: previousNode,
    nextConnectionNode: nextNode,
    cycle,
  })
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
  const connectionNodeNeighbor = cycle.find((node) => graph.areNeighbors(connectionNode, node))
  const cycleUnpairedNode = cycle.find((node) => !graph.isPaired(node))

  if (!connectionNodeNeighbor || !cycleUnpairedNode) throw new Error('Cannot link blossom cycle')

  // we need to build a path from connectionNodeNeighbor to cycleUnpairedNode
  // such as the number of steps is even (the length of the path has to be odd)
  return evenStepsPath({ start: connectionNodeNeighbor, target: cycleUnpairedNode, cycle })
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

function evenStepsPath(params: ClockPathParams) {
  const path = clockWisePath(params)

  return path.length % 2 !== 0 ? path : counterClockWisePath(params)
}

function mod(a: number, m: number) {
  return ((a % m) + m) % m
}

type RestoreMiddleBlossomParams = {
  graph: BlossomGraph
  nextConnectionNode: string
  previousConnectionNode: string
  cycle: string[]
}

function restoreMiddleBlossom({
  graph,
  previousConnectionNode,
  nextConnectionNode,
  cycle,
}: RestoreMiddleBlossomParams) {
  const pairedConnectionNode = [previousConnectionNode, nextConnectionNode].find((node) =>
    graph.isPaired(node)
  )

  const unpairedConnectionNode = [previousConnectionNode, nextConnectionNode].find(
    (node) => !graph.isPaired(node)
  )

  if (
    !pairedConnectionNode ||
    !unpairedConnectionNode ||
    pairedConnectionNode === unpairedConnectionNode
  )
    throw new Error('Middle blossom has inconsistent connection nodes')

  const pairedConnectionNodeNeighbor = graph.getMate(pairedConnectionNode)
  const unpairedConnectionNodeNeighbor = cycle.find(
    (node) =>
      node !== pairedConnectionNodeNeighbor && graph.areNeighbors(node, unpairedConnectionNode)
  )

  if (!unpairedConnectionNodeNeighbor)
    throw new Error("Middle blossom doesn't have a neighbor to link the unpaired connection node")

  const [start, target] = graph.isPaired(previousConnectionNode)
    ? [pairedConnectionNodeNeighbor, unpairedConnectionNodeNeighbor]
    : [unpairedConnectionNodeNeighbor, pairedConnectionNodeNeighbor]

  return evenStepsPath({ start, target, cycle })
}
