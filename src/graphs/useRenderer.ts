import { useCallback, useEffect, useState } from 'react'
import Sigma from 'sigma'
import { createGraph, CreateGraphParams } from './create'
import { removeChildren } from './utils'

type UseRendererParams = CreateGraphParams

export function useRenderer(params: UseRendererParams) {
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return

      removeChildren(node)

      const graph = createGraph(params)

      new Sigma(graph, node, {
        defaultEdgeColor: '#2D2D2D',
        defaultNodeColor: '#ffc419',
        labelSize: 40,
        edgeLabelWeight: '',
      })
    },
    [params]
  )

  return ref
}
