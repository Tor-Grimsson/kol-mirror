import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MirrorPlayground from './pages/MirrorPlayground'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MirrorPlayground />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
