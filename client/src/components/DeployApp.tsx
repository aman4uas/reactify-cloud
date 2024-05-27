import { useParams } from 'react-router-dom'
import { useState, ChangeEvent } from 'react'
import axios from 'axios'
import { Zoom, toast } from 'react-toastify'

interface Variable {
  key: string
  value: string
  visible: boolean
}

const DeployApp = () => {
  const { id } = useParams()

  const repo = id
  const [variables, setVariables] = useState<Variable[]>([])
  const [branches] = useState(['main', 'master'])
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
        buildDirectory
      }
      const backend_url = import.meta.env.VITE_BACKEND_URL
      console.log(backend_url)

      const response = await axios.post(`${backend_url}/deploy/app`, data, {
        withCredentials: true
      })

      console.log(response.data)
      window.location.href = `/log/${response.data.data}`
    } catch (error) {
      console.log(error)
      toast.error('Error Deploying the app!!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
        transition: Zoom
      })
    }
  }

  const handleVariableChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-md shadow-md w-full max-w-3xl lg:w-3/4 md:w-full sm:w-full">
        <h1 className="text-xl mb-6">Let's deploy your project.</h1>

        <div className="mb-4">
          <label className="block mb-2">Branch to deploy</label>
          <select
            value={selectedBranch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded"
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Base directory</label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-700 rounded"
            value={baseDirectory}
            onChange={(e) => setBaseDirectory(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Build command</label>
          <input
            type="text"
            value={buildCommand}
            onChange={(e) => setBuildCommand(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Publish directory</label>
          <input
            type="text"
            value={buildDirectory}
            onChange={(e) => setBuildDirectory(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Environment variables</label>
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
                className="px-3 py-2 bg-gray-600 rounded mr-2"
                onClick={() => toggleVisibility(index)}
              >
                {variable.visible ? 'Hide' : 'View'}
              </button>
              <button
                type="button"
                className="px-3 py-2 bg-red-600 rounded"
                onClick={() => handleRemoveVariable(index)}
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-2 bg-blue-600 rounded"
            onClick={handleAddVariable}
          >
            New variable
          </button>
        </div>

        <button
          onClick={submitHandler}
          className="w-full px-3 py-2 bg-green-600 rounded"
        >
          Deploy
        </button>
      </div>
    </div>
  )
}

export default DeployApp
