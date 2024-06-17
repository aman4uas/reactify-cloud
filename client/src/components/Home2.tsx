import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './styles/ScrollBar.css'
import { useParams } from 'react-router-dom'
import Confetti from 'react-dom-confetti'
import Loader from './helper/Loader'
import { dateToStringWithTime } from '../utils/dateToString'
import Navbar from './Navbar'

import { FaExternalLinkAlt } from 'react-icons/fa'

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

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: '10px',
  height: '10px',
  perspective: '500px',
  colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
}

const Logs = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [celebrate, setCelebrate] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [deploymentDetail, setDeploymentDetail] = useState<IDeploymentDetail | null>(null)
  const [siteDetail, setSiteDetail] = useState<ISiteDetail | null>(null)
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
    const logs: string[] = []
    for (const log of rawLogs) {
      if (log.output1) logs.push(log.output1)
      if (log.output2) logs.push(log.output2)
    }
    return logs
  }

  const refreshLogs = async () => {
    try {
      const x = await getDeploymentDetail(id!)
      setDeploymentDetail(x)
      const y = await getLogs(id!)
      setLogs(y)
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
      return x
    } catch (error) {
      console.error('Error refreshing logs:', error)
    }
  }

  const times = useRef(0) // Use useRef for times
  const maxTimes = 50
  const waitTime = 4 // In Seconds

  const fetchLogs = async () => {
    while (times.current < maxTimes) {
      times.current += 1
      try {
        const updatedDeploymentDetail = await refreshLogs()
        const currentStatus = updatedDeploymentDetail?.status
        if (currentStatus === 'Success' || currentStatus === 'Failed') {
          if (currentStatus === 'Success') {
            console.log('Success')
          }
          return
        }
        await delay(waitTime * 1000)
      } catch (error) {
        console.log(error)
        return
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const deploymentDetail = await getDeploymentDetail(id!)
        setDeploymentDetail(deploymentDetail)

        const siteDetail = await getSiteDetail(deploymentDetail.projectId)
        setSiteDetail(siteDetail)

        let siteUrl = proxy_url.replace('http://', '').replace('https://', '')
        if (siteDetail) siteUrl = 'http://' + siteDetail.customDomain + '.' + siteUrl
        setSiteUrl(siteUrl)
        const updatedDeploymentDetail = await refreshLogs()
        setLoading(false)
        const currentStatus = updatedDeploymentDetail?.status
        if (currentStatus !== 'Success' || currentStatus !== 'Failed') {
          await fetchLogs()
        } else if (currentStatus === 'Success') {
          console.log('Success')
        }
        setCelebrate(true)
      } catch (error) {
        console.error('Error initializing component:', error)
      }
    }

    init()
  }, [id])

  if (loading) return <Loader />

  return (
    <div className="h-screen bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center">
        <div className="flex items-center w-full max-w-7xl mx-auto my-6 p-4 sm:p-6 lg:p-8 h-full space-x-4">
          <div className="w-full h-[90%] sm:w-2/5 lg:w-1/3 bg-gray-800 text-white rounded-lg shadow-lg p-4 flex flex-col">
            <h2 className="text-2xl font-semibold mb-2">{siteDetail?.repoName}</h2>
            <p className="text-sm mb-2">
              Deploys from <span className="text-blue-400">@{siteDetail?.branchName}</span>
            </p>
            <p className="text-sm mb-2">
              Published on {dateToStringWithTime(new Date(deploymentDetail!.createdAt))}
            </p>
            <a
              className="flex items-center text-sm mb-2"
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link to Site <FaExternalLinkAlt className="ml-1 text-blue-500" />
            </a>
            <p
              className={`text-lg font-semibold ${
                deploymentDetail?.status === 'Success'
                  ? 'text-green-400'
                  : deploymentDetail?.status === 'Failed'
                    ? 'text-red-500'
                    : 'text-white'
              }`}
            >
              {deploymentDetail?.status === 'Success'
                ? 'Deployed Successfully 🎉'
                : deploymentDetail?.status === 'Failed'
                  ? '❌ Deployment Failed'
                  : 'In Progress'}
            </p>
          </div>

          {/* <div className="w-full h-[80%] sm:w-3/5 lg:w-2/3 bg-black text-white font-mono rounded-lg flex flex-col">
          <div className="bg-gray-900 p-2 flex flex-row justify-between items-center">
            <div>LOGS</div>
          </div>
          <div ref={terminalRef} className="overflow-auto flex-grow terminal-scrollbar p-4">
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
        </div> */}
        </div>

      </div>
       <div className='w-0 h-0'>
        <Confetti active={celebrate} config={ config }/>
      </div>
    </div>
  )
}

export default Logs
