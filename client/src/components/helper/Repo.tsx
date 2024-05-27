import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

interface IRepo {
  name: string
  language: string
  updated_at: string
  visibility: string
}

const Repo = () => {
  const [repos, setRepo] = useState([])
  useEffect(() => {
    const getRepoData = async () => {
      const backend_url = import.meta.env.VITE_BACKEND_URL

      const response = await axios.get(`${backend_url}/github/repos`, {
        withCredentials: true
      })
      const repo = response.data.data
      setRepo(repo)
    }

    getRepoData()
  }, [])
  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg">
        {repos.map((repo: IRepo, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-gray-700 p-4 rounded-lg mb-4"
          >
            <div>
              <h2 className="text-xl font-semibold">{repo.name}</h2>
              <p className="text-gray-400">{repo.language}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">{repo.updated_at}</span>
              <span
                className={`px-2 py-1 rounded-full ${
                  repo.visibility === 'public' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {repo.visibility === 'public' ? 'Public' : 'Private'}
              </span>
              <span>
                <Link
                  to={`/deploy/${repo.name}`}
                  className="text-decoration-none"
                >
                  <button className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-300">
                    Deploy
                  </button>
                </Link>
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Repo
