import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Login, Home, DeployApp, SiteDeployments, Logs, Navbar, Site, Home2 } from './components'

function App() {
  return (
    <div className="h-screen">
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/deploy/:id" element={<DeployApp />} />
        <Route path="/log/:id" element={<Logs />} />
        <Route path="/site/:id" element={<SiteDeployments />} />
        <Route path="/site" element={<Site />} />
        <Route path="/test" element={<Home2 />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <ToastContainer />
    </div>
  )
}

export default App
