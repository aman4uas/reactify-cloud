import Repo from './helper/Repo'
import Navbar from './Navbar'

const Home = () => {
  return (
    <>
    <Navbar />
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
      <Repo/>
      </div>
    </div>
    </>
    
  )
}
export default Home
