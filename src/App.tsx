import { useRenderer } from './hooks/useRenderer'

const App = () => {
  const ref = useRenderer()

  return <div ref={ref}></div>
}

export default App
