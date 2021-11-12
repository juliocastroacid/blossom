export const removeChildren = (node: HTMLElement) => {
  while (node.firstChild) node.removeChild(node.firstChild)
}
