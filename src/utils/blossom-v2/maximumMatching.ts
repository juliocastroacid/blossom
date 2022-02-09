import Graph from 'graphology'
import { AugmentingPath } from './AugmentingPath'
import { Blossom } from './Blossom'
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
  const augmentingPathFinder = new AugmentingPathFinder({ graph, forest })

  let currentNode: Node | undefined
  while ((currentNode = forest.pickNextToCheck())) {
    for (const neighbor of graph.neighborsThroughUnpairedEdges(currentNode)) {
      const { augmentingPath, blossom } = augmentingPathFinder.tryToConnectWithAugmentingPath(
        currentNode,
        neighbor
      )

      if (augmentingPath) return augmentingPath
      if (blossom) return findAugmentingPathHavingABlossom(graph, blossom)
    }
  }

  return undefined
}

function findAugmentingPathHavingABlossom(
  graph: BlossomGraph,
  blossom: Blossom
): AugmentingPath | undefined {
  const graphWithoutBlossom = graph.compressBlossom(blossom)
  const augmentingPath = findAugmentingPath(graphWithoutBlossom)

  if (!augmentingPath) return undefined

  const expander = new SuperNodeExpander({ graph, blossom })

  return augmentingPath.flatMap((node, index) =>
    !graphWithoutBlossom.isSuperNode(node)
      ? [node]
      : expander.expandHaving({
          previousNode: augmentingPath[index - 1],
          nextNode: augmentingPath[index + 1],
        })
  )
}

type SuperNodeExpanderConstructor = {
  graph: BlossomGraph
  blossom: Blossom
}

type SuperNodeExpandParams = {
  previousNode?: Node
  nextNode?: Node
}

enum BlossomPathDirection {
  CLOCK_WISE = 'CLOCK_WISE',
  COUNTER_CLOCK_WISE = 'COUNTER_CLOCK_WISE',
}

class SuperNodeExpander {
  private readonly graph: BlossomGraph

  private readonly blossom: Blossom

  constructor(p: SuperNodeExpanderConstructor) {
    this.graph = p.graph
    this.blossom = p.blossom
  }

  isRootMate(node: Node) {
    return this.graph.isPaired(node) && this.graph.getMate(node) === this.blossom.root
  }

  expandHaving({ previousNode, nextNode }: SuperNodeExpandParams): Node[] {
    const { root } = this.blossom

    const startNode =
      !previousNode || this.isRootMate(previousNode) ? root : this.findConnectionOf(previousNode)
    const endNode = !nextNode || this.isRootMate(nextNode) ? root : this.findConnectionOf(nextNode)

    return this.buildEvenPath(startNode, endNode)
  }

  private findConnectionOf(node: Node): Node {
    const connectionNode = this.blossom.cycle.find((n) => this.graph.areNeighbors(n, node))

    if (!connectionNode)
      throw new Error(
        "Cannot expand super node: it doesn't have a connection node with the rest of the augmenting path"
      )

    return connectionNode
  }

  private buildEvenPath(from: Node, to: Node): Node[] {
    const path = this.blossomPath(from, to, { direction: BlossomPathDirection.CLOCK_WISE })

    return path.length % 2 !== 0
      ? path
      : this.blossomPath(from, to, { direction: BlossomPathDirection.COUNTER_CLOCK_WISE })
  }

  private blossomPath(
    from: Node,
    to: Node,
    { direction = BlossomPathDirection.CLOCK_WISE as BlossomPathDirection } = {}
  ): Node[] {
    const { cycle } = this.blossom

    const startIndex = this.blossom.cycle.findIndex((node) => node === from)
    const indexInc = direction === BlossomPathDirection.CLOCK_WISE ? 1 : -1

    const path: string[] = []
    for (let i = startIndex; path[path.length - 1] !== to; i = this.mod(i + indexInc, cycle.length))
      path.push(cycle[i])

    return path
  }

  private mod(a: number, m: number) {
    return ((a % m) + m) % m
  }
}

type AugmentingPathFinderConstructor = {
  graph: BlossomGraph
  forest: Forest
}

class AugmentingPathFinder {
  private readonly graph: BlossomGraph

  private readonly forest: Forest

  constructor(readonly p: AugmentingPathFinderConstructor) {
    this.graph = p.graph
    this.forest = p.forest
  }

  tryToConnectWithAugmentingPath(currentNode: Node, neighbor: Node) {
    if (!this.forest.has(neighbor)) {
      this.visitNodeOutsideForest(currentNode, neighbor)

      return {}
    }

    if (!this.areConnectable(currentNode, neighbor)) return {}

    if (this.forest.areInTheSameTree(currentNode, neighbor))
      return { blossom: this.blossomCycle(currentNode, neighbor) }

    return { augmentingPath: this.connect(currentNode, neighbor) }
  }

  private visitNodeOutsideForest(currentNode: Node, outsider: Node) {
    const outsiderMate = this.graph.getMate(outsider)

    this.forest
      .findTreeOrFail(currentNode)
      .connect(currentNode, outsider)
      .connect(outsider, outsiderMate)

    this.forest.checkLater(outsiderMate)
  }

  private areConnectable(_currentNode: Node, neighbor: Node) {
    return this.forest.distanceToItsRootTree(neighbor) % 2 === 0
  }

  private connect(currentNode: Node, neighbor: Node): AugmentingPath {
    return [
      ...this.forest.pathToItsRootTree(currentNode).reverse(),
      ...this.forest.pathToItsRootTree(neighbor),
    ]
  }

  private blossomCycle(currentNode: Node, neighbor: Node): Blossom {
    const currentNodeRootPath = this.forest.pathToItsRootTree(currentNode)
    const neighbotRootPath = this.forest.pathToItsRootTree(neighbor)

    const intersection = currentNodeRootPath.filter((node) => neighbotRootPath.includes(node))
    const [pivot] = intersection

    const cycle = [
      ...currentNodeRootPath.slice(0, currentNodeRootPath.indexOf(pivot)),
      pivot,
      ...neighbotRootPath.slice(0, neighbotRootPath.indexOf(pivot)).reverse(),
    ]

    return new Blossom({ cycle, root: pivot })
  }
}
