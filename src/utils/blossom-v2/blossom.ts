import Graph from 'graphology'
import { AugmentingPath } from './AugmentingPath'
import { BlossomGraph } from './BlossomGraph'
import { Forest } from './Forest'
import { Node } from './Node'

export function maximumMatching(graph: Graph) {
  const blossomGraph = BlossomGraph.createFrom(graph)

  let augmentingPath: AugmentingPath | undefined

  while ((augmentingPath = findAugmentingPath(blossomGraph))) {
    blossomGraph.augmentWith(augmentingPath)
  }

  return blossomGraph
}

function findAugmentingPath(graph: BlossomGraph): AugmentingPath | undefined {
  const forest = Forest.fromRoots(graph.unpairedNodes())

  let currentNode: Node | undefined
  while ((currentNode = forest.pickNextToCheck())) {
    for (const neighbor of graph.neighborsThroughUnpairedEdges(currentNode)) {
      const augmentingPath = buildAugmentingPath({ from: currentNode, to: neighbor, forest, graph })

      if (augmentingPath) return augmentingPath
    }
  }

  return undefined
}

function buildAugmentingPath(params: {
  from: Node
  to: Node
  forest: Forest
  graph: BlossomGraph
}): AugmentingPath | undefined {
  const { from, to, forest, graph } = params

  if (!forest.has(to)) {
    visitNodeOutsideForest({ nodeInsideForest: from, nodeOutsideForest: to, forest, graph })

    return
  }

  if (!forest.areConnectable(from, to)) return

  if (forest.areInTheSameTree(from, to)) {
    // TODO: remove blossom, call algorithm again and complete blossom
    return
  }

  return forest.connect(from, to)
}

function visitNodeOutsideForest(params: {
  nodeInsideForest: Node
  nodeOutsideForest: Node
  forest: Forest
  graph: BlossomGraph
}) {
  const { nodeInsideForest, nodeOutsideForest, forest, graph } = params
  const nodeOutsideForestMate = graph.getMate(nodeOutsideForest)

  forest.findTreeOrFail(nodeInsideForest).addChild(nodeOutsideForest).addChild(nodeOutsideForestMate)
  forest.checkLater(nodeOutsideForestMate)
}
