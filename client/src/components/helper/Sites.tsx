import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { errorHandler, authHandler, apiGetRequest } from '../../utils'
import { useNavigate } from 'react-router-dom'

const backend_url = import.meta.env.VITE_BACKEND_URL
const proxy_url = import.meta.env.VITE_PROXY_URL

import rightArrow from '../../assets/rightArrowIcon.png'

interface ISitesData {
  _id: string
  repoName: string
  branchName: string
  customDomain: string
}

const getSiteUrl = (customDomain: string) => {
  let url = proxy_url.startsWith('https://') ? 'https://' : 'http://'
  url = url + `${customDomain}.` + proxy_url.replace('http://', '').replace('https://', '')
  return url
}

const Sites = () => {
  const [sites, setSites] = useState([])
  const [empty, setEmpty] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const getSitesData = async () => {
      const response = await apiGetRequest(`${backend_url}/deploy/sites`, true)
      if (authHandler(response)) {
        navigate('/login')
        return
      }
      if (errorHandler(response)) return
      const result = response.data.data
      if (result.length === 0) setEmpty(true)
      setSites(result)
    }

    getSitesData()
  }, [])
  return (
    <>
      {empty ? (
        <div className="text-center mt-20">
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9h-4V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H5v10a2 2 0 002 2h10a2 2 0 002-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11v6m4-6v6" />
          </svg>
          <p className="text-lg text-gray-400">You don't have any deployed site yet !!</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-1 md:p-4 rounded-lg">
          {sites.map((app: ISitesData, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row m-1 md:m-3 md:justify-between md:items-center bg-gray-700 p-4 rounded-lg"
            >
              <div>
                <h2 className="text-xl font-semibold">{app.repoName}</h2>
                <p className="text-gray-400">Branch: {app.branchName}</p>
              </div>
              <div className="flex items-center space-x-4 my-auto">
                <a
                  href={getSiteUrl(app.customDomain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white bg-gradient-to-r my-2 w-full md:w-auto md:m-0 from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                >
                  Visit Site
                </a>

                <Link to={`/site/${app._id}`} className="hidden md:block w-[35px]">
                  <img
                    src={rightArrow}
                    className="h-[28px] animate-move-left "
                    alt="Description of the image"
                  />
                </Link>

                <Link
                  to={`/site/${app._id}`}
                  className="md:hidden my-2 w-full md:w-auto md:m-0 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  Site Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Sites
