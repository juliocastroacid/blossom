import { useCallback } from 'react'
import { createRenderer } from '../utils/create'
import { removeChildren } from '../utils/removeChildren'

export function useRenderer() {
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return

    removeChildren(node)

    createRenderer({ node })
  }, [])

  return ref
}
