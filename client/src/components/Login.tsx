import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGetRequest, toastMessage } from '../utils'

const loginHandler = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) {
    try {
      const response = await apiGetRequest(`${backendUrl}/github/auth`, true)
      if (response.data.success) {
        const githubAuthUrl = response.data.url
        window.location.href = githubAuthUrl
      } else {
        console.log(response.data.message || 'Authentication failed')
      }
    } catch (error) {
      console.log('Error during authentication', error)
    }
  } else {
    console.log('Backend URL is not defined')
    toastMessage('Backend URL missing !!', false)
  }
}

const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleGitHubCallback = async (code: string) => {
      try {
        const response = await apiGetRequest(
          `${import.meta.env.VITE_BACKEND_URL}/github/auth/callback?code=${code}`,
          false
        )
        if (response.data.success) {
          localStorage.setItem('accessToken', response.data.token)
          if (response.data.token) console.log('Token:', response.data.token)
          else toastMessage('Error getting token', false)
          navigate('/')
        } else {
          console.log(response.data.message || 'Login failed', false)
          toastMessage('Cannot find Access Token !!', false)
        }
      } catch (error) {
        console.log('Error during callback handling', error)
      }
    }

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      handleGitHubCallback(code)
    }
  })

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Navigation bar */}
      <nav className="">
        <div className="max-w-screen-xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <img
                src="https://img.icons8.com/?size=100&id=t4YbEbA834uH&format=png&color=000000"
                className="h-12"
                alt="Reactify Cloud Logo"
              />
              <span className="text-2xl font-semibold whitespace-nowrap">Reactify Cloud</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="mt-20 m-8 font-inter font-extrabold text-4xl text-center">
          Login to deploy your project
        </div>

        <button
          onClick={loginHandler}
          className="m-10 flex items-center px-8 py-4 bg-gray-800 text-lg rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mb-8"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.838 1.235 1.838 1.235 1.07 1.834 2.809 1.305 3.495.998.107-.775.418-1.305.762-1.605-2.665-.305-5.466-1.335-5.466-5.931 0-1.311.467-2.381 1.235-3.221-.123-.303-.535-1.528.117-3.184 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.399 3-.405 1.02.006 2.043.139 3 .405 2.289-1.552 3.295-1.23 3.295-1.23.654 1.656.243 2.881.12 3.184.77.84 1.235 1.91 1.235 3.221 0 4.609-2.804 5.622-5.476 5.921.43.37.823 1.103.823 2.222v3.293c0 .32.218.694.825.577C20.565 21.796 24 17.303 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          Log in with GitHub
        </button>
      </div>

      <div className="mt-auto text-gray-300 text-center mb-4">
        By logging in with Reactify Cloud, you agree to our{' '}
        <a href="#" target="_blank" className="underline">
          terms and conditions
        </a>
        .
      </div>
    </div>
  )
}

export default Login
