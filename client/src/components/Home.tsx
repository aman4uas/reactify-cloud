import { useEffect, useState } from 'react'
import axios from 'axios'
import Repo from './helper/Repo'
import Sites from './helper/Sites'
import Loader from './helper/Loader'

const backend_url = import.meta.env.VITE_BACKEND_URL

const Home = () => {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('repo')
  const [username, setUsername] = useState('Your Username')
  const [profile_img, setProfileImg] = useState(
    'https://via.placeholder.com/200'
  )

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(`${backend_url}/github/user`, {
          withCredentials: true
        })
        const user = response.data.data
        setUsername(user.username)
        setProfileImg(user.avatar_url)
        setLoading(false)
      } catch (error) {
        window.location.href = '/login'
      }
    }

    getUserData()
  }, [])

  function repoClickHandler() {
    if (mode !== 'repo') setMode('repo')
  }

  function siteClickHandler() {
    if (mode !== 'site') setMode('site')
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-row items-center">
            <img
              className="w-16 h-16 rounded-full mr-4"
              src={profile_img}
              alt="Profile"
            />
            <h1 className="text-2xl font-bold">{username}</h1>
          </div>
          <div className="flex flex-row">
            <button
              onClick={repoClickHandler}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                GitHub Repos
              </span>
            </button>

            <button
              onClick={siteClickHandler}
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Your Sites
              </span>
            </button>
          </div>
        </div>

        {mode === 'repo' ? <Repo /> : <Sites />}
      </div>
    </div>
  )
}
export default Home
