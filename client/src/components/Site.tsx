import Navbar from './Navbar'
import Sites from './helper/Sites'
const Site = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Sites />
        </div>
      </div>
    </>
  )
}

export default Site
