import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/navbar';
import Inicio from './Pages/inicio';
import ModuloUsuarios from './Pages/ModuloUsuarios';
import SubidaMasiva from './Components/SubidaMasiva';
import Error404 from './Pages/Error404';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Inicio />} />
        <Route path='/usuarios' element={<ModuloUsuarios />} />
        <Route path='/subida-masiva' element={<SubidaMasiva />} />
        <Route path='/categorias' element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Módulo de Categorías</h1>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        } />
        <Route path='/productos' element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Módulo de Productos</h1>
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        } />
        <Route path='/*' element={<Error404 />} />
      </Routes>
    </Router>
  )
}

export default App