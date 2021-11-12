import { useState } from 'react'
import { useRenderer } from './hooks/useRenderer'

const App = () => {
  const [verticesCount, setVerticesCount] = useState(4)
  const ref = useRenderer({ numberOfVertices: verticesCount })

  return (
    <>
      <button onClick={() => setVerticesCount((count) => count + 1)}>
        Vertices Count {verticesCount}
      </button>
      <div ref={ref}></div>
    </>
  )
}

export default App
