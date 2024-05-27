import { Request, Response } from 'express'
import { User } from '../models'
import axios from 'axios'

const branchData = async (req: Request, res: Response) => {
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
  const repo = req.params.id
  const url = `https://api.github.com/repos/${username}/${repo}/branches`

  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${accessToken}`
    }
  })

  const branches = response.data.map((element: { name: any }) => {
    return element.name
  })

  return res.status(200).json({
    success: true,
    data: branches
  })
}

export { branchData }
