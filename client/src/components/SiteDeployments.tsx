import { useParams } from 'react-router-dom'
import { useState, useEffect, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGetRequest, apiPostRequest, toastMessage } from '../utils'
import {
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTrash,
  FaTools,
  FaExternalLinkAlt,
  FaGithub,
  FaCheckCircle,
  FaTimesCircle,
  FaLink,
  FaCheck,
  FaCloudUploadAlt
} from 'react-icons/fa'

import Navbar from './Navbar'
import { errorHandler, authHandler } from '../utils'
import apiLimitReachedImg from '../assets/api-limit-reached.png'
import Loader from './helper/Loader'
import LoadingScreenshot from '../assets/loading.gif'

import { dateToString, dateToStringWithTime } from '../utils/dateToString'

const backend_url = import.meta.env.VITE_BACKEND_URL
const proxy_url = import.meta.env.VITE_PROXY_URL

interface ISiteDetail {
  _id: string
  repoName: string
  branchName: string
  customDomain: string
  createdBy: string
  buildCommand: string
  sourceDirectory: string
  publishDirectory: string
  autoDeploy: boolean
  createdAt: Date
}

interface IDeployment {
  _id: string
  projectId: string
  status: string
  createdAt: string
  publish?: boolean
}

interface Variable {
  key: string
  value: string
  visible: boolean
}

const sanitize = (input: string) => {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

const SiteDeployments = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [deployments, setDeployments] = useState<IDeployment[]>([])
  const [siteDetail, setSiteDetail] = useState<ISiteDetail | null>(null)
  const [siteUrl, setSiteUrl] = useState('')
  const [variables, setVariables] = useState<Variable[]>([])
  const [customSubdomain, setCustomSubdomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [changeDomainButtonDisable, setChangeDomainButtonDisable] = useState(false)
  const [updateConfigurationButtonDisable, setUpdateConfigurationButtonDisable] = useState(false)
  const [sitePreviewUrl, setSitePreviewUrl] = useState(LoadingScreenshot)

  useEffect(() => {
    const getSiteDeployments = async () => {
      const response = await apiPostRequest(`${backend_url}/deploy/site/deployments`, true, { projectId: id })
      if (authHandler(response)) {
        navigate('/login')
        return
      }
      if (errorHandler(response)) return
      const temp_deployments = response.data.data
      for (let i = 0; i < temp_deployments.length; i++) {
        if (temp_deployments[i].status === 'Success') {
          temp_deployments[i].publish = true
          break
        }
      }
      setDeployments(temp_deployments)

      const response2 = await apiGetRequest(`${backend_url}/deploy/site/${id}`, true)
      if (authHandler(response2)) {
        navigate('/login')
        return
      }
      if (errorHandler(response2)) return
      const siteData = response2.data.data
      setSiteDetail(siteData)
      let siteUrl = proxy_url.replace('http://', '')
      siteUrl = siteUrl.replace('https://', '')
      if (siteData.customDomain) {
        siteUrl = 'http://' + siteData.customDomain + '.' + siteUrl
      }
      setSiteUrl(siteUrl)
      setLoading(false)
      await getLiveWebSitePreview(siteUrl)
    }

    const getLiveWebSitePreview = async (url: string) => {
      try {
        const apiUrl = 'https://v1.nocodeapi.com/amanhacks4u/screen/wnYEfxEBTwRADJsv/screenshot';
        const params = {
          url: url,
          inline: 'json',
          delay: 1,
          viewport: '1366x768',
        }
        const response = await apiGetRequest(apiUrl, false, params)
        if(response.data.error){
          setSitePreviewUrl(apiLimitReachedImg)
        }
        else{
          setSitePreviewUrl(response.data.location)
        }
      } catch (error) {
        console.log(error)
        setSitePreviewUrl(apiLimitReachedImg)
      }
    }


    try {
      getSiteDeployments()
    } catch (error) {
      toastMessage('Something went wrong !!', false)
    }
  }, [id])

  useEffect(() => {
    if (siteDetail) {
      let flag = false
      if (proxy_url.startsWith('https://')) flag = true
      let siteUrl = proxy_url.replace('http://', '')
      siteUrl = siteUrl.replace('https://', '')
      if (siteDetail.customDomain) {
        siteUrl = 'http' + (flag ? 's' : '') + '://' + siteDetail.customDomain + '.' + siteUrl
        setSiteUrl(siteUrl)
      }
    }
  }, [siteDetail])

  const editConfigurationHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    setSiteDetail((prevState) => {
      if (prevState) {
        return {
          ...prevState,
          [name]: value
        }
      }
      return prevState
    })
  }

  const customDomainHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const val = sanitize(e.target.value)
    setCustomSubdomain(val)
    if (e.target.value === '') {
      setCustomDomain('')
      return
    }
    let siteUrl = proxy_url.replace('http://', '')
    siteUrl = siteUrl.replace('https://', '')
    siteUrl = 'http://' + val + '.' + siteUrl
    setCustomDomain(siteUrl)
  }

  const handleVariableChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setVariables((prevVariables) => {
      const newVariables = [...prevVariables]
      newVariables[index] = {
        ...newVariables[index],
        [name]: value
      }
      return newVariables
    })
  }

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '', visible: false }])
  }

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const toggleVisibility = (index: number) => {
    setVariables((prevVariables) => {
      const newVariables = [...prevVariables]
      newVariables[index] = {
        ...newVariables[index],
        visible: !newVariables[index].visible
      }
      return newVariables
    })
  }

  const updateConfigurationHandler = async () => {
    setUpdateConfigurationButtonDisable(true)
    if (siteDetail?.buildCommand.length === 0 || siteDetail?.publishDirectory.length === 0) {
      toastMessage('Build Command & Publish Directory are mandatory fields !!', false)
      return
    }
    if (!siteDetail) {
      toastMessage('Unable to get Site Details !!', false)
      return
    }

    try {
      const response = await apiPostRequest(
        backend_url + '/site/update/configuration',
        true,
        {
          autoDeploy: siteDetail.autoDeploy,
          publishDirectory: siteDetail.publishDirectory,
          buildCommand: siteDetail.buildCommand,
          id: siteDetail._id,
          sourceDirectory: siteDetail.sourceDirectory,
          env: variables
        }
      )
      if (authHandler(response)) {
        navigate('/login')
        return
      }

      if (errorHandler(response)) {
        setUpdateConfigurationButtonDisable(false)
        return
      }

      navigate(`/log/${response.data.data}`)
    } catch (error) {
      toastMessage('Something went wrong !!', false)
      setUpdateConfigurationButtonDisable(false)
    }
  }

  const updateCustomDomainHandler = async () => {
    if (customSubdomain.length < 4 || customSubdomain.length > 15) {
      let message = 'Length must be at least 4'
      if (customSubdomain.length > 15) message = 'Length must be less than 16'
      toastMessage(message, false)
      return
    }
    try {
      setChangeDomainButtonDisable(true)
      const response = await apiPostRequest(
        `${backend_url}/site/update/customDomain`, 
        true, 
        { customSubdomain, id: siteDetail?._id }
      )
      if (authHandler(response)) {
        navigate('/login')
        return
      }
      if (errorHandler(response)) return

      setSiteDetail((prevState) => {
        if (prevState) {
          return {
            ...prevState,
            customDomain: customSubdomain
          }
        }
        return prevState
      })

      setCustomDomain('')
      setCustomSubdomain('')
      if (response.data.success) {
        toastMessage('Successfully updated the domain !!', true)
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toastMessage(errorMessage, false)
    } finally {
      setChangeDomainButtonDisable(false)
    }
  }

  return loading ? (
    <>
      <Navbar />
      <Loader />
    </>
  ) : (
    <>
      <Navbar />
      <div className="bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-full sm:w-4/5 md:w-2/3 flex flex-col my-2 p-2 md:flex-row justify-between items-center sm:p-6 lg:p-8 bg-gray-800 text-white rounded-lg shadow-lg">
          <div className="w-full md:w-[40%] px-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">{siteDetail!.repoName}</h2>
            <a target="_blank" href={siteUrl} className="hover:underline break-all flex items-center">
              {siteUrl} <FaExternalLinkAlt className="ml-1" />
            </a>
            <p className="mt-2">
              {siteDetail?.autoDeploy ? (
                <span className="flex items-center text-green-400">
                  <FaCheckCircle className="mr-1" /> Auto publishing is on.
                </span>
              ) : (
                <span className="flex items-center text-red-500">
                  <FaTimesCircle className="mr-1" /> Auto publishing is off.
                </span>
              )}
            </p>
            <p className="mt-4">
              Deploys from{' '}
              <a
                href={`https://github.com/${siteDetail?.createdBy}/${siteDetail?.repoName}`}
                className="inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="hover:underline">GitHub</span>
                <FaGithub className="inline-block ml-1" />
              </a>
            </p>
            <p className="mt-1">Published on 📅 {dateToString(new Date(siteDetail!.createdAt))}.</p>
          </div>

          <div className="flex justify-center flex-shrink-0 ml-4 w-full md:w-[60%]">
            <img
              src={sitePreviewUrl}
              alt="Site Preview"
              className="rounded-lg shadow-md h-[100px] md:h-[200px]"
            />
          </div>
        </div>

        <div className="w-full sm:w-4/5 md:w-2/3 mx-auto my-1 mb-4 p-4 sm:p-6 lg:p-8 bg-gray-800 text-white rounded-lg shadow-lg">
          <h1 className="text-2xl mb-6 text-center flex items-center justify-center">
            <FaCloudUploadAlt className="mr-2" /> Deploys
          </h1>
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }} className="terminal-scrollbar">
            {deployments.map((_deployment) => (
              <Link to={`/log/${_deployment._id}`}>
                <div
                  key={_deployment._id}
                  className="mx-auto my-3 p-4 bg-gray-900 text-white rounded-lg shadow-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-mono">
                        <span className="underline text-blue-600">{_deployment._id}</span>
                      </span>
                      {_deployment.publish ? (
                        <span className="ml-2 bg-green-600 text-white rounded px-2 py-1 text-xs">
                          Published
                        </span>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{dateToStringWithTime(new Date(_deployment.createdAt))}</p>
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
                </div>{' '}
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full sm:w-4/5 md:w-[55%]  mx-auto my-1 p-4 sm:p-6 lg:p-8 bg-gray-800 text-white rounded-lg shadow-lg">
          <div className="bg-gray-800 p-8 rounded-md shadow-md w-full">
            <div className="mb-4">
              <h1 className="text-2xl mb-4 flex items-center justify-center">
                <FaLink className="inline-block mr-2" /> Set Custom Domain
              </h1>
              <div className="mb-4">
                <label className="block mb-2">✏️ Enter Subdomain</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 rounded"
                  value={customSubdomain}
                  onChange={customDomainHandler}
                  spellCheck="false"
                />
                <p className="ml-2 my-2 text-gray-400">{customDomain}</p>
              </div>
              <button
                onClick={updateCustomDomainHandler}
                className="w-full px-3 py-2 bg-blue-600 rounded hover:bg-blue-500 flex items-center justify-center"
                disabled={changeDomainButtonDisable}
              >
                <FaCheck className="inline-block mr-2" />
                Update Domain
              </button>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-4/5 md:w-[55%] mx-auto my-1 mb-5 p-4 sm:p-6 lg:p-8 bg-gray-800 text-white rounded-lg shadow-lg">
          <div className="bg-gray-800 p-8 rounded-md shadow-md w-full">
            <h1 className="text-2xl mb-6 text-center">
              <FaTools className="inline-block mr-2" /> Update Your Site Configuration
            </h1>

            <div className="mb-4">
              <label className="block mb-2">📁 Base Directory</label>
              <input
                name="sourceDirectory"
                type="text"
                className="w-full px-3 py-2 bg-gray-700 rounded"
                value={siteDetail?.sourceDirectory}
                onChange={editConfigurationHandler}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">🛠 Build Command</label>
              <input
                name="buildCommand"
                type="text"
                value={siteDetail?.buildCommand}
                onChange={editConfigurationHandler}
                className="w-full px-3 py-2 bg-gray-700 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">📂 Publish Directory</label>
              <input
                type="text"
                name="publishDirectory"
                value={siteDetail?.publishDirectory}
                onChange={editConfigurationHandler}
                className="w-full px-3 py-2 bg-gray-700 rounded"
              />
            </div>

            <div className="flex items-center mb-4">
              <label className="inline-block mr-4">🚀 Auto-deploy</label>
              <input
                className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-blue-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                type="checkbox"
                checked={siteDetail?.autoDeploy}
                onChange={editConfigurationHandler}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">🔧 Environment Variables</label>
              {variables.map((variable, index) => (
                <div key={index} className="mb-2 flex items-center">
                  <input
                    type="text"
                    name="key"
                    placeholder="Key"
                    className="w-1/3 px-3 py-2 bg-gray-700 rounded mr-2"
                    value={variable.key}
                    onChange={(e) => handleVariableChange(index, e)}
                  />
                  <input
                    type={variable.visible ? 'text' : 'password'}
                    name="value"
                    placeholder="Value"
                    className="w-2/3 px-3 py-2 bg-gray-700 rounded mr-2"
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, e)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-gray-600 rounded mr-2 hover:bg-gray-500"
                    onClick={() => toggleVisibility(index)}
                  >
                    {variable.visible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-red-600 rounded hover:bg-red-500"
                    onClick={() => handleRemoveVariable(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-3 py-2 bg-blue-600 rounded hover:bg-blue-500 flex items-center justify-center"
                onClick={handleAddVariable}
              >
                <FaPlus className="mr-2" /> Add Variable
              </button>
            </div>

            <button
              className="w-full px-3 py-2 bg-green-600 rounded hover:bg-green-500"
              disabled={updateConfigurationButtonDisable}
              onClick={updateConfigurationHandler}
            >
              <FaTools className="inline-block mr-2" /> Update Configuration
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SiteDeployments
