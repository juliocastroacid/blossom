import Graph from 'graphology'

export class MyGraph extends Graph {
  ang = 0
  inc: number

  constructor(readonly myNodes: string[]) {
    super()
    this.inc = (2 * Math.PI) / myNodes.length
  }

  addNode(node: string) {
    const nodeObj = {
      x: Math.cos(this.ang),
      y: Math.sin(this.ang),
      size: 20,
      label: node,
    }

    this.incAngle()

    return super.addNode(node, nodeObj)
  }

  private incAngle() {
    this.ang += this.inc
  }
}
