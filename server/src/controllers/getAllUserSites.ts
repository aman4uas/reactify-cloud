import { Request, Response } from 'express'
import { Project } from '../models'

const getAllUserSites = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username

    if (!username) {
      return res.status(200).json({
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
          _id: 1,
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
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Something went wrong !!',
      error: error
    })
  }
}

export { getAllUserSites }
