import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MirrorPlayground from './pages/MirrorPlayground'

const ArchiveIndex = lazy(() => import('./pages/VideoModuloIndex.jsx'))
const Case01 = lazy(() => import('./videomodulo/arc-case/case-01/SynthWorkspace.jsx'))
const Case02 = lazy(() => import('./videomodulo/arc-case/case-02/SynthWorkspace.jsx'))
const Case03 = lazy(() => import('./videomodulo/arc-case/case-03/Case2Workspace.jsx'))
const VideoModulo = lazy(() => import('./videomodulo/VideoModulo.jsx'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<MirrorPlayground />} />
          <Route path="/index" element={<ArchiveIndex />} />
          <Route path="/index/case-01" element={<Case01 />} />
          <Route path="/index/case-02" element={<Case02 />} />
          <Route path="/index/case-03" element={<Case03 />} />
          <Route path="/videomodulo" element={<VideoModulo />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
