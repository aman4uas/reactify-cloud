import { Request, Response } from 'express'
import { User } from '../models'
import axios from 'axios'

const userData = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      return res.status(200).json({
        success: false,
        message: 'Username is required'
      })
    }

    const current_user = await User.findOne({ username })

    if (!current_user || !current_user.gitHubToken) {
      return res.status(200).json({
        success: false,
        message: 'User or GitHub token not found'
      })
    }

    const accessToken = current_user.gitHubToken

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    })
    let data = {
      username: userResponse.data.login,
      avatar_url: userResponse.data.avatar_url
    }
    return res.status(200).json({
      success: true,
      data: data
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong !!",
      error: error
    })
  }
}

export { userData }
