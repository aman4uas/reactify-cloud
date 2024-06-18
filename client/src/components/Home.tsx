import Repo from './helper/Repo'
import Navbar from './Navbar'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      navigate(`/login?${code}`)
    }
  })
  return (
    <>
      <Navbar />
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Repo />
        </div>
      </div>
    </>
  )
}
export default Home
