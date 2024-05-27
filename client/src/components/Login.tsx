const loginHandler = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) {
    window.location.href = `${backendUrl}/github/auth`
  } else {
    console.error('Backend URL is not defined')
  }
}

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <button
        onClick={loginHandler}
        className="flex items-center px-6 py-3 bg-gray-800 text-white text-lg rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
      >
        <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.838 1.235 1.838 1.235 1.07 1.834 2.809 1.305 3.495.998.107-.775.418-1.305.762-1.605-2.665-.305-5.466-1.335-5.466-5.931 0-1.311.467-2.381 1.235-3.221-.123-.303-.535-1.528.117-3.184 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.399 3-.405 1.02.006 2.043.139 3 .405 2.289-1.552 3.295-1.23 3.295-1.23.654 1.656.243 2.881.12 3.184.77.84 1.235 1.91 1.235 3.221 0 4.609-2.804 5.622-5.476 5.921.43.37.823 1.103.823 2.222v3.293c0 .32.218.694.825.577C20.565 21.796 24 17.303 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        Log in with GitHub
      </button>
    </div>
  )
}

export default Login
