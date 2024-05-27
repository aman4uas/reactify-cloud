import { Request, Response } from 'express'
import { Project } from '../models'

const getAllUserSites = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      })
    }

    const projects = await Project.aggregate([
      {
        $match: { createdBy: username }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          repoName: 1,
          branchName: 1,
          customDomain: 1,
          createdAt: 1
        }
      }
    ])

    return res.status(200).json({
      success: true,
      data: projects
    })
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error
    })
  }
}

export { getAllUserSites }
