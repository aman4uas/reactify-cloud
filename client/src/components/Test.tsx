import { useLocation } from 'react-router-dom'

const Test = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const code = params.get('code')
  return (
    <div>
      <h1>
        This is Code <span>{code ? code : "undefined"}</span>
      </h1>
    </div>
  )
}

export default Test
