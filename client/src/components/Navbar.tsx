import { Link, useNavigate } from 'react-router-dom'
import { useState, useContext, useEffect } from 'react'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { UserContext } from '../context/UserContext'
import { errorHandler, toastMessage, authHandler, apiGetRequest } from '../utils'

const backend_url = import.meta.env.VITE_BACKEND_URL

const Navbar = () => {
  const navigate = useNavigate()
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const { username, setUsername, imageLink, setImageLink } = useContext(UserContext)

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible)
  }
  const logoutHandler = async () => {
    try {
      localStorage.setItem('accessToken', '')
      setUsername(null)
      setImageLink(null)
      navigate('/login')
    } catch (error) {
      console.log(error)
      toastMessage('Error in signing Out !!', false)
    }
  }

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (username !== null && imageLink !== null) return
        const response = await apiGetRequest(`${backend_url}/github/user`, true)
        if (authHandler(response)) {
          navigate('/login')
          return
        }
        if (errorHandler(response)) return
        const user = response.data.data
        setUsername(user.username)
        setImageLink(user.avatar_url)
      } catch (error) {
        toastMessage('Something went wrong !!', false)
      }
    }

    getUserData()
  }, [])
  return (
    <nav className="border-gray-200 bg-gray-800">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://img.icons8.com/?size=100&id=t4YbEbA834uH&format=png&color=000000"
            className="h-12"
            alt="Reactify Cloud Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            Reactify Cloud
          </span>
        </Link>

        <div className="-translate-x-8 hidden md:flex items-center space-x-3 md:space-x-0 rtl:space-x-reverse relative">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-gray-800 md:bg-gray-800 border-gray-700">
            <li>
              <Link
                to="/"
                className="block mx-3 py-2 px-3 md:p-0 rounded text-white md:hover:text-purple-500 hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/site"
                className="block mx-3 py-2 px-3 md:p-0 rounded text-white md:hover:text-blue-500 hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700"
              >
                Sites
              </Link>
            </li>
          </ul>
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center rounded-full cursor-pointer m-0 p-0"
            onClick={toggleDropdown}
          >
            <img
              className="h-12 rounded-full "
              src={
                imageLink ||
                'https://static.vecteezy.com/system/resources/previews/021/548/095/non_2x/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg'
              }
              alt="User"
            />
            {dropdownVisible ? (
              <FaCaretUp className="mx-1 md:mx-2 text-white h-4 md:h-5 " />
            ) : (
              <FaCaretDown className="mx-1 md:mx-2 text-white h-4 md:h-5 " />
            )}
          </button>

          {dropdownVisible && (
            <div className="absolute right-0 mt-2 w-44 z-10 divide-y rounded-lg shadow bg-gray-700 divide-gray-600">
              <div className="px-4 py-3 text-sm text-white">
                <div className="font-medium truncate">{username || 'Undefined-User'}</div>
              </div>
              <div className="py-1 block md:hidden">
                <Link
                  to="/site"
                  className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
                >
                  Sites
                </Link>
              </div>

              <div className="py-1">
                <button
                  onClick={logoutHandler}
                  className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
