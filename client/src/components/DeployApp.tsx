import { useParams } from 'react-router-dom'
import { useState, ChangeEvent, useEffect } from 'react'
import axios from 'axios'
import { errorHandler, toastMessage } from '../utils'
import Navbar from './Navbar'
import { FaReact, FaEye, FaEyeSlash, FaPlus, FaTrash } from 'react-icons/fa'

const backend_url = import.meta.env.VITE_BACKEND_URL
interface Variable {
  key: string
  value: string
  visible: boolean
}

const DeployApp = () => {
  const { id } = useParams()

  const repo = id
  const [variables, setVariables] = useState<Variable[]>([])
  const [branches, setBranches] = useState(['main'])
  const [autodeploy, setAutodeploy] = useState(true)
  const [selectedBranch, setBranch] = useState('main')
  const [baseDirectory, setBaseDirectory] = useState('')
  const [buildCommand, setBuildCommand] = useState('npm run build')
  const [buildDirectory, setBuildDirectory] = useState('build')

  const submitHandler = async () => {
    try {
      const data = {
        repo,
        envVariables: variables,
        selectedBranch,
        baseDirectory,
        buildCommand,
        buildDirectory,
        autodeploy
      }
      const response = await axios.post(`${backend_url}/deploy/app`, data, {
        withCredentials: true
      })

      if (errorHandler(response)) return
      window.location.href = `/log/${response.data.data}`
    } catch (error) {
      console.log(error)
      toastMessage("Something went wrong!!", false)
    }
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

  useEffect(() => {
    const getBranches = async()=>{
      const response = await axios.get(`${backend_url}/github/branches/${id}`, {
        withCredentials: true
      })
     if( errorHandler(response)) return
     if(response.data.data.length===0) return
     setBranches(response.data.data)
     setBranch(response.data.data[0])
    }

    getBranches()
  }, [])


  return (
    <>
      <Navbar />
      <div className="py-5 bg-gray-900 text-white flex justify-center items-center">
        <div className="bg-gray-800 p-8 rounded-md shadow-md w-full max-w-3xl lg:w-3/4 md:w-full sm:w-full">
          <h1 className="text-2xl mb-6 text-center">
            🚀 Deploy Your React <FaReact className="inline text-[#61DAFB]" /> Project
          </h1>

          <div className="mb-4">
            <label className="block mb-2">📂 Branch to Deploy</label>
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setBranch(e.target.value)}
                className="appearance-none w-full px-4 py-2 bg-gray-700 rounded"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-1 md:right-2 flex items-center px-2 text-gray-200">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">📁 Base Directory</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded"
              value={baseDirectory}
              onChange={(e) => setBaseDirectory(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">🛠 Build Command</label>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">📂 Publish Directory</label>
            <input
              type="text"
              value={buildDirectory}
              onChange={(e) => setBuildDirectory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded"
            />
          </div>

          <div className="flex items-center mb-4">
            <label className="inline-block mr-4">🚀 Auto-deploy</label>
            <input
              className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-blue-600 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
              type="checkbox"
              checked={autodeploy}
              onChange={() => setAutodeploy(!autodeploy)}
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
              <FaPlus className="mr-2" /> New Variable
            </button>
          </div>

          <button
            onClick={submitHandler}
            className="w-full px-3 py-2 bg-green-600 rounded hover:bg-green-500"
          >
            🚀 Deploy
          </button>
        </div>
      </div>
    </>
  )
}

export default DeployApp
