import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import Loader from './helper/Loader'
import { dateToString, dateToStringWithTime } from '../utils/dateToString'

const backend_url = import.meta.env.VITE_BACKEND_URL
const proxy_url = import.meta.env.VITE_PROXY_URL

interface ISiteDetail {
  repoName: string
  branchName: string
  customDomain: string
  createdAt: string
}

interface IDeployment {
  _id: string
  projectId: string
  status: string
  createdAt: string
  publish?: boolean
}

const SiteDeployments = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [deployments, setDeployments] = useState<IDeployment[]>([])
  const [siteDetail, setSiteDetail] = useState<ISiteDetail | null>(null)
  const [siteUrl, setSiteUrl] = useState('')

  useEffect(() => {
    const getSiteDeployments = async () => {
      const response = await axios.post(
        `${backend_url}/deploy/site/deployments`,
        { projectId: id },
        {
          withCredentials: true
        }
      )
      const temp_deployments = response.data.data
      for (let i = 0; i < temp_deployments.length; i++) {
        if (temp_deployments[i].status === 'Success') {
          temp_deployments[i].publish = true
          break
        }
      }
      setDeployments(temp_deployments)

      const response2 = await axios.get(`${backend_url}/deploy/site/${id}`, {
        withCredentials: true
      })
      setSiteDetail(response2.data.data)
      let siteUrl = proxy_url.replace('http://', '')
      siteUrl = siteUrl.replace('https://', '')
      if (siteDetail)
        siteUrl = 'http://' + siteDetail.customDomain + '.' + siteUrl
      setSiteUrl(siteUrl)
      setLoading(false)
    }

    getSiteDeployments()
  }, [siteDetail])

  return loading ? (
    <Loader />
  ) : (
    <div className="dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full sm:w-4/5 lg:w-2/3 xl:w-1/2 mx-auto my-4 mt-6 p-4 sm:p-6 lg:p-8 bg-gray-800 text-white rounded-lg shadow-lg">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
          {siteDetail!.repoName}
        </h2>
        <a href={siteUrl} className="text-blue-400 hover:underline break-all">
          {siteUrl}
        </a>
        <p className="mt-4">
          Deploys from{' '}
          <a
            href="https://github.com"
            className="text-blue-400 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
        <p className="mt-1">
          Published on {dateToString(new Date(siteDetail!.createdAt))}.
        </p>
      </div>

      {deployments.map((_deployment) => (
        <div className="w-full sm:w-4/5 lg:w-2/3 xl:w-1/2 mx-auto my-1 p-4 bg-gray-800 text-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-mono">
                {siteDetail?.branchName}@
                <Link to={`/log/${_deployment._id}`}>
                  <span className="underline text-blue-600">
                    {_deployment._id}
                  </span>
                </Link>
              </span>
              {_deployment.publish ? (
                <span className="ml-2 bg-green-600 text-white rounded px-2 py-1 text-xs">
                  Published
                </span>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-sm">
                {dateToStringWithTime(new Date(_deployment.createdAt))}
              </p>
              <p
                className={
                  _deployment.status === 'Success'
                    ? 'text-green-500'
                    : _deployment.status === 'Failed'
                      ? 'text-red-500'
                      : 'text-white'
                }
              >
                {_deployment.status}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SiteDeployments
