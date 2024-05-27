import { Request, Response } from 'express'
import { formatDistanceToNow } from 'date-fns'
import { User } from '../models'
import axios from 'axios'

const convertToRelativeTime = (isoDate: Date) => {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true })
}

const repoData = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      })
    }

    const current_user = await User.findOne({ username })

    if (!current_user || !current_user.gitHubToken) {
      return res.status(404).json({
        success: false,
        message: 'User or GitHub token not found'
      })
    }

    const accessToken = current_user.gitHubToken

    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    })

    let repos = reposResponse.data.map((element: any) => {
      let obj = {
        name: element.name,
        visibility: element.visibility,
        language: element.language,
        updated_at: convertToRelativeTime(element.updated_at)
      }
      return obj
    })

    return res.status(200).json({
      success: true,
      data: repos
    })
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: 'Something went wrong !!',
      error: error
    })
  }
}

export { repoData }
