import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './styles/ScrollBar.css'
import refreshImg from '../assets/refresh.png'
import { useParams } from 'react-router-dom'
import Loader from './helper/Loader'
import { dateToStringWithTime } from '../utils/dateToString'

const backend_url = import.meta.env.VITE_BACKEND_URL
const proxy_url = import.meta.env.VITE_PROXY_URL

interface IDeploymentDetail {
  _id: string
  projectId: string
  status: string
  createdAt: string
}

interface ISiteDetail {
  _id: string
  repoName: string
  branchName: string
  customDomain: string
  createdAt: string
}

const Logs = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [deploymentDetail, setDeploymentDetail] =
    useState<IDeploymentDetail | null>(null)
  const [siteDetail, setSiteDetail] = useState<ISiteDetail | null>(null)
  const [disableButton, setDisableButton] = useState(false)
  const [siteUrl, setSiteUrl] = useState('')

  const getDeploymentDetail = async (id: string) => {
    const url = `${backend_url}/deploy/site/deployment/${id}`
    const response = await axios.get(url, { withCredentials: true })
    return response.data.data
  }

  const getSiteDetail = async (id: string) => {
    const url = `${backend_url}/deploy/site/${id}`
    const response = await axios.get(url, { withCredentials: true })
    return response.data.data
  }

  const getLogs = async (id: string) => {
    const response = await axios.post(
      `${backend_url}/deploy/site/deployment/logs`,
      { deploymentId: id },
      { withCredentials: true }
    )
    const rawLogs = response.data.data
    const logs = []
    for (const log of rawLogs) {
      if (log.output1) logs.push(log.output1)
      if (log.output2) logs.push(log.output2)
    }

    return logs
  }

  const refreshLogs = async () => {
    setDisableButton(true)
    const x = await getDeploymentDetail(id!)
    setDeploymentDetail(x)
    const y = await getLogs(id!)
    setLogs(y)
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
    setDisableButton(false)
  }

  useEffect(() => {
    const init = async () => {
      const deploymentDetail = await getDeploymentDetail(id!)
      setDeploymentDetail(deploymentDetail)

      const logs = await getLogs(id!)
      setLogs(logs)

      const siteDetail = await getSiteDetail(deploymentDetail.projectId)
      setSiteDetail(siteDetail)

      setLoading(false)
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }

      let siteUrl = proxy_url.replace('http://', '')
      siteUrl = siteUrl.replace('https://', '')
      if (siteDetail)
        siteUrl = 'http://' + siteDetail.customDomain + '.' + siteUrl
      setSiteUrl(siteUrl)
    }

    init()
  }, [id])

  if (loading) return <Loader />

  return (
    <div className="dark:bg-gray-900 h-screen flex items-center justify-center">
      <div className="flex items-center w-full max-w-7xl mx-auto my-6 p-4 sm:p-6 lg:p-8 h-full space-x-4">
        <div className="w-full h-[90%] sm:w-2/5 lg:w-1/3 bg-gray-800 text-white rounded-lg shadow-lg p-4 flex flex-col">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
            {siteDetail?.repoName}
          </h2>
          <p className="mt-4">
            Deploys from{' '}
            <span className="text-blue-400 hover:underline">
              @{siteDetail?.branchName}
            </span>
          </p>
          <p className="mt-1">
            Published on{' '}
            {dateToStringWithTime(new Date(deploymentDetail!.createdAt))}
          </p>
          <a
            className="text-blue-600 underline"
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Link to Site
          </a>
          <p
            className={
              deploymentDetail?.status === 'Success'
                ? 'text-green-500'
                : deploymentDetail?.status === 'Failed'
                  ? 'text-red-500'
                  : 'text-white'
            }
          >
            {deploymentDetail?.status}
          </p>
        </div>

        <div className="w-full h-[80%] sm:w-3/5 lg:w-2/3 bg-black text-white font-mono rounded-lg flex flex-col">
          <div className="bg-gray-900 p-2 flex flex-row justify-between items-center">
            <div>LOGS</div>
            <button disabled={disableButton} onClick={refreshLogs}>
              <img className="h-[25px]" src={refreshImg} alt="Refresh" />
            </button>
          </div>
          <div
            ref={terminalRef}
            className="overflow-auto flex-grow terminal-scrollbar p-4"
          >
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index}>
                  <div className="text-gray-200 whitespace-pre-wrap">
                    <span className="text-green-400">{`>>`} </span>
                    {log}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logs
