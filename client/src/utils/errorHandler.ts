import { AxiosResponse } from 'axios'
import { toastMessage } from './toastMessage'
interface ApiResponse {
  success: boolean
  message?: string
}

const errorHandler = (response: AxiosResponse<ApiResponse>) => {
  if (response.data.success === false){
    if(response.data.message === 'User Unauthorised !!'){
      window.location.href = '/login'
    }
    else {
      console.log(response.data.message)
      toastMessage(response.data.message || "An error occurred", false)
    }
    return true
  }
  return false
}

export { errorHandler }
