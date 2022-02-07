import { Node } from './Node'

type BlossomConstructor = {
  root: Node
  cycle: Node[]
}

export class Blossom {
  public readonly root: Node

  public readonly cycle: Node[]

  constructor(p: BlossomConstructor) {
    this.root = p.root
    this.cycle = p.cycle
  }

  has(node: Node) {
    return this.cycle.includes(node)
  }
}
