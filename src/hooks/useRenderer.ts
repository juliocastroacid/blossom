import { useCallback } from 'react'
import { CreateGraphParams, createRenderer } from '../utils/create'
import { removeChildren } from '../utils/removeChildren'

export function useRenderer(graphParams: CreateGraphParams) {
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return

      removeChildren(node)

      createRenderer({ ...graphParams, node })
    },
    [graphParams]
  )

  return ref
}
