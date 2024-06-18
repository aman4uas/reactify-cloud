import { useEffect, useState } from 'react'
import { errorHandler, authHandler, apiGetRequest } from '../../utils'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

interface IRepo {
  name: string
  language: string
  updated_at: string
  visibility: string
}

const Repo = () => {
  const [repos, setRepo] = useState<IRepo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<IRepo[]>([])
  const [repoFetched, setRepoFetched] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [empty, setEmpty] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const getRepoData = async () => {
      const backend_url = import.meta.env.VITE_BACKEND_URL
      try {
        const response = await apiGetRequest(`${backend_url}/github/repos`, true)
        if (authHandler(response)) {
          navigate('/login')
          return
        }
        if (errorHandler(response)) {
          setRepoFetched(true)
          return
        }
        const repo = response.data.data
        setRepo(repo)
        setFilteredRepos(repo)
        if (repo.length === 0) setEmpty(true)
        setRepoFetched(true)
      } catch (error) {
        console.error('Error fetching repo data:', error)
      }
    }

    getRepoData()
  }, [])

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase()
    setFilteredRepos(repos.filter((repo) => repo.name.toLowerCase().includes(lowercasedQuery)))
  }, [searchQuery, repos])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-0 mt-0">
      <div className="relative mb-6 max-w-md mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search..."
        />
        <svg
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            fill="white"
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          ></path>
        </svg>
      </div>

      {!repoFetched ? (
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-white mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0l-3.5 3.5L8 4m5-1.5L16.5 8H20a8 8 0 01-8 8v2.5L8 16.5z"
            ></path>
          </svg>
          <p>Server might take upto 1 min to respond for the first request!!</p>
        </div>
      ) : empty ? (
        <div className="text-center mt-20">
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12a10.002 10.002 0 006.839 9.501c.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.533 1.032 1.533 1.032.892 1.529 2.341 1.088 2.91.832.091-.647.35-1.089.636-1.339-2.22-.252-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.029-2.687-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.547 1.376.202 2.393.1 2.646.641.699 1.028 1.594 1.028 2.687 0 3.848-2.338 4.695-4.567 4.943.359.31.678.921.678 1.856 0 1.34-.012 2.42-.012 2.748 0 .268.18.579.688.48A10.002 10.002 0 0022 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          <p className="text-lg text-gray-400">No repositories found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRepos.map((repo: IRepo, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800 p-4 rounded-lg shadow-lg"
            >
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold">{repo.name}</h2>
                <p className="text-gray-400">{repo.language}</p>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <span className="text-gray-400">{repo.updated_at}</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    repo.visibility === 'public' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {repo.visibility === 'public' ? 'Public' : 'Private'}
                </span>
                <Link to={`/deploy/${repo.name}`} className="text-decoration-none">
                  {/* <button className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-500 transition-colors duration-300">
                    Deploy
                  </button> */}
                  <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-green-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">
                      Deploy
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Repo
