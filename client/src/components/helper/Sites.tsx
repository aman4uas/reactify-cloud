import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const backend_url = import.meta.env.VITE_BACKEND_URL
const proxy_url = import.meta.env.VITE_PROXY_URL

import rightArrow from '../../assets/rightArrowIcon.png'

interface ISitesData {
  _id: string
  repoName: string
  branchName: string
  customDomain: string
}

const Sites = () => {
  const [sites, setSites] = useState([])
  useEffect(() => {
    const getSitesData = async () => {
      const response = await axios.get(`${backend_url}/deploy/sites`, {
        withCredentials: true
      })
      const result = response.data.data
      setSites(result)
    }

    getSitesData()
  }, [])
  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg">
        {sites.map((app: ISitesData, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-gray-700 p-4 rounded-lg mb-4"
          >
            <div>
              <h2 className="text-xl font-semibold">{app.repoName}</h2>
              <p className="text-gray-400">Branch: {app.branchName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`http://${app.customDomain}.` + ((proxy_url.replace("http://", "")).replace("https://", ""))}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                Visit Site
              </a>
              <Link to={`/site/${app._id}`}>
                <img
                  src={rightArrow}
                  width="35px"
                  alt="Description of the image"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Sites
